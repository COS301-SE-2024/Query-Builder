import { Test, TestingModule } from '@nestjs/testing';
import { MongoJsonConverterService } from './mongo-json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';
import {
  ComparisonOperator,
  primitiveCondition,
  compoundCondition,
  LogicalOperator
} from '../../interfaces/dto/conditions.dto';

describe('MongoJsonConverterService', () => {
  let service: MongoJsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoJsonConverterService]
    }).compile();

    service = module.get<MongoJsonConverterService>(MongoJsonConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertJsonToQuery', () => {
    it('should generate a MongoDB query for finding country names starting with B', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        condition: {
          column: 'country',
          operator: ComparisonOperator.LIKE,
          value: 'B%'
        } as primitiveCondition
      };

      const expectedQuery = {
        find: 'country',
        filter: {
          country: { $regex: 'B%' }
        },
        projection: {
          country: 1
        }
      };

      const result = service.convertJsonToQuery(jsonData);
      expect(result).toEqual(expectedQuery);
    });

    it('should generate a MongoDB query with no filter when condition is undefined', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        }
      };

      const expectedQuery = {
        find: 'country',
        filter: {},
        projection: {
          country: 1
        }
      };

      const result = service.convertJsonToQuery(jsonData);
      expect(result).toEqual(expectedQuery);
    });

    it('should generate a MongoDB query with skip and limit parameters', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        pageParams: {
          pageNumber: 2,
          rowsPerPage: 10
        }
      };

      const expectedQuery = {
        find: 'country',
        filter: {},
        projection: {
          country: 1
        },
        skip: 10, // Skip the first page
        limit: 10
      };

      const result = service.convertJsonToQuery(jsonData);
      expect(result).toEqual(expectedQuery);
    });

    it('should generate a MongoDB query with compound conditions', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        condition: {
          operator: '$and',
          conditions: [
            {
              column: 'country_id',
              operator: ComparisonOperator.GREATER_THAN,
              value: 50
            },
            {
              column: 'country',
              operator: ComparisonOperator.LIKE,
              value: 'A%'
            }
          ]
        } as unknown as compoundCondition
      };

      const expectedQuery = {
        find: 'country',
        filter: {
          $and: [{ country_id: { $gt: 50 } }, { country: { $regex: 'A%' } }]
        },
        projection: {
          country: 1
        }
      };

      const result = service.convertJsonToQuery(jsonData);
      expect(result).toEqual(expectedQuery);
    });

    it('should generate a MongoDB query with sort parameters', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        sortParams: {
          column: 'country',
          direction: 'ascending'
        }
      };

      const expectedQuery = {
        find: 'country',
        filter: {},
        projection: {
          country: 1
        },
        sort: {
          country: 1
        }
      };

      const result = service.convertJsonToQuery(jsonData);
      expect(result).toEqual(expectedQuery);
    });

    it('should throw an error for unsupported SQL operator', () => {
      const jsonData: QueryParams = {
        language: 'mongodb',
        query_type: 'find',
        databaseName: 'sakila',
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        condition: {
          column: 'country',
          operator: 'UNSUPPORTED_OPERATOR' as ComparisonOperator,
          value: 'A%'
        } as primitiveCondition
      };

      expect(() => service.convertJsonToQuery(jsonData)).toThrowError(
        'Unsupported operator: UNSUPPORTED_OPERATOR'
      );
    });
  });

  describe('convertJsonToCountQuery', () => {
    it('should return a message indicating that the method is not implemented', () => {
      expect(service.convertJsonToCountQuery({} as QueryParams)).toStrictEqual({
        message: 'Not implemented'
      });
    });
  });

  describe('generateFindString', () => {
    it('should return the table name', () => {
      const jsonData: QueryParams = {
        table: {
          name: 'country',
          columns: [{ name: 'country' }]
        },
        language: '',
        query_type: '',
        databaseName: ''
      };

      expect(service.generateFindString(jsonData)).toBe('country');
    });
  });

  describe('generateFilterObject', () => {
    it('should return an empty object when condition is undefined', () => {
      expect(service.generateFilterObject(undefined)).toEqual({});
    });

    it('should generate a filter object for a primitive condition', () => {
      const condition: primitiveCondition = {
        column: 'country',
        operator: ComparisonOperator.LIKE,
        value: 'A%',
        type: 'c'
      };

      expect(service.generateFilterObject(condition)).toEqual({
        country: { $regex: 'A%' }
      });
    });

    it('should generate a filter object for a compound condition', () => {
      const condition: compoundCondition = {
        operator: LogicalOperator.AND,
        conditions: [
          {
            column: 'country_id',
            operator: ComparisonOperator.GREATER_THAN,
            value: 50
          },
          {
            column: 'country',
            operator: ComparisonOperator.LIKE,
            value: 'A%'
          }
        ]
      } as unknown as compoundCondition;

      expect(service.generateFilterObject(condition)).toEqual({
        "AND": [{ country_id: { $gt: 50 } }, { country: { $regex: 'A%' } }]
      });
    });
  });
});
