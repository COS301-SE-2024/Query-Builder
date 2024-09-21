import { Test, TestingModule } from '@nestjs/testing';
import { PostgresJsonConverterService } from './postgres-json-converter.service';
import { primitiveCondition } from '../../interfaces/dto/conditions.dto';
import { QueryParams } from '../../interfaces/dto/query.dto';

describe('PostgresJsonConverterService', () => {
  let service: PostgresJsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresJsonConverterService]
    }).compile();

    service = module.get<PostgresJsonConverterService>(
      PostgresJsonConverterService
    );
  });

  //------------------------------------- Service setup test -------------------------------------//

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //------------------------------------- Individual functions tests -------------------------------------//

  it('should generate a postgres query for finding country names starting with B', () => {
    const jsonData: QueryParams = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'country',
        columns: [{ name: 'country' }]
      },
      condition: {
        column: 'country',
        operator: 'LIKE',
        value: 'B%'
      } as primitiveCondition
    };

    const expectedQuery =
      'SELECT "country" FROM "country" WHERE "country" LIKE \'B%\'';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should generate SELECT clause with object column names', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'country',
        columns: [{ name: 'country' }, { name: 'population' }]
      }
    };

    const expectedQuery = 'SELECT "country", "population" FROM "country"';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should generate WHERE clause with string value', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'country',
        columns: [{ name: 'country' }]
      },
      condition: {
        column: 'country',
        operator: 'LIKE',
        value: 'B%'
      } as primitiveCondition
    };

    const expectedQuery =
      'SELECT "country" FROM "country" WHERE "country" LIKE \'B%\'';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should generate WHERE clause with numeric value', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'population',
        columns: [{ name: 'population' }]
      },
      condition: {
        column: 'population',
        operator: '>',
        value: 10000
      } as primitiveCondition
    };

    const expectedQuery =
      'SELECT "population" FROM "population" WHERE "population" > 10000';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should handle single quotes in string values for WHERE clause', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'people',
        columns: [{ name: 'name' }]
      },
      condition: {
        column: 'name',
        operator: 'LIKE',
        value: "O'Reilly"
      } as primitiveCondition
    };

    const expectedQuery =
      'SELECT "name" FROM "people" WHERE "name" LIKE \'O\'\'Reilly\'';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should generate GROUP BY clause with columns', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'country',
        columns: [{ name: 'country' }]
      },
      groupBy: ['country', 'state']
    };

    const expectedQuery =
      'SELECT "country" FROM "country" GROUP BY "country", "state"';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  it('should return empty GROUP BY clause if no columns', () => {
    const jsonData = {
      language: 'postgres',
      query_type: 'select',
      databaseName: 'sakila',
      table: {
        name: 'country',
        columns: [{ name: 'country' }]
      },
      groupBy: []
    };

    const expectedQuery = 'SELECT "country" FROM "country"';
    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual(expectedQuery);
  });

  describe('convertJsonToQuery', () => {
    it('should throw an error for invalid language', () => {
      const jsonData: QueryParams = {
        language: 'invalidLang',
        query_type: 'select',
        table: {
          name: 'test_table',
          columns: [{ name: 'col1' }, { name: 'col2' }]
        },
        databaseName: 'sakila'
      };

      expect(() => service.convertJsonToQuery(jsonData)).toThrowError(
        'Invalid language'
      );
    });

    it('should throw an error for unsupported query type', () => {
      const jsonData: QueryParams = {
        language: 'postgres',
        query_type: 'invalidType',
        table: {
          name: 'test_table',
          columns: [{ name: 'col1' }, { name: 'col2' }]
        },
        databaseName: 'sakila'
      };

      expect(() => service.convertJsonToQuery(jsonData)).toThrowError(
        'Unsupported query type'
      );
    });

    it('should throw an error for missing table columns', () => {
      const jsonData: QueryParams = {
        language: 'postgres',
        query_type: 'select',
        table: {
          name: 'test_table',
          columns: []
        },
        databaseName: 'sakila'
      };

      expect(() => service.convertJsonToQuery(jsonData)).toThrowError(
        'Invalid query'
      );
    });

    it('should return a correct SQL query for valid input', () => {
      const jsonData: QueryParams = {
        databaseName: 'sakila',
        language: 'postgres',
        query_type: 'select',
        table: {
          name: 'test_table',
          columns: [{ name: 'col1' }, { name: 'col2' }]
        },
        condition: {
          column: 'col1',
          operator: '=',
          value: 'value1'
        } as primitiveCondition
      };

      const result = service.convertJsonToQuery(jsonData);
      const expectedQuery =
        'SELECT "col1", "col2" FROM "test_table" WHERE "col1" = \'value1\'';

      expect(result).toBe(expectedQuery);
    });
  });

  describe('generateSelectClausePost', () => {
    it('should return "*" if table or columns are missing', () => {
      const jsonDataMissingTable: QueryParams = {
        language: 'postgres',
        query_type: 'select',
        table: null,
        databaseName: 'sakila'
      };

      const jsonDataMissingColumns: QueryParams = {
        language: 'postgres',
        query_type: 'select',
        table: {
          name: 'test_table',
          columns: null // Columns are missing
        },
        databaseName: 'sakila'
      };

      const resultMissingTable =
        service.generateSelectClausePost(jsonDataMissingTable);
      const resultMissingColumns = service.generateSelectClausePost(
        jsonDataMissingColumns
      );

      expect(resultMissingTable).toBe('*');
      expect(resultMissingColumns).toBe('*');
    });
  });
});
