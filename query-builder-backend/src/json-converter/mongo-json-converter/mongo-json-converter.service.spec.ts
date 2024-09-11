import { Test, TestingModule } from '@nestjs/testing';
import { MongoJsonConverterService } from './mongo-json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';
import {
  ComparisonOperator,
  primitiveCondition,
  compoundCondition
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
});
