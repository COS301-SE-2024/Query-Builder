import { Test, TestingModule } from '@nestjs/testing';
import { PostgresJsonConverterService } from './postgres-json-converter.service';
import { AggregateFunction, ComparisonOperator, compoundCondition, primitiveCondition } from '../../interfaces/dto/conditions.dto';
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

  //------------------------------------- Complete query conversion tests -------------------------------------//

  it('should report an error when no columns are specified for a table', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [] },
    };

    try {
        service.convertJsonToQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe("No columns specified for table 'users'");
    }

  });

  it('should be able to convert queries with multiple columns selected', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name" FROM "users"';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with aggregation and aliasing', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [{ name: 'id', aggregation: AggregateFunction.COUNT, alias: "Number" }] },
    };

    const expectedQuery = 'SELECT COUNT("users"."id") AS "Number" FROM "users"';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with joins', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users',
            columns: [{ name: 'id' }],
            join: {
                table1MatchingColumnName: "id",
                table2MatchingColumnName: "user_id",
                table2: {
                    name: "actors",
                    columns: [{ name: "role" }]
                }
            }
        },
    };

    const expectedQuery = 'SELECT "users"."id", "actors"."role" FROM "users" JOIN "actors" ON "users"."id"="actors"."user_id"';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with sorting in descending order', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
        sortParams: {
            column: 'first_name',
            direction: "descending"
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name" FROM "users" ORDER BY "first_name" DESC';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with sorting in ascending order', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
        sortParams: {
            column: 'first_name'
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name" FROM "users" ORDER BY "first_name" ASC';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries using pagination', () => {

    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name" FROM "users" LIMIT 10 OFFSET 20';

    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);

  });

  it('should be able to throw an error if mandatory fields are missing', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
    };

    try {
        service.convertJsonToQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Invalid query');
    }

  });

  it('should be able to throw an error if it is an unsupported query type', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'UPDATE',
    };

    try {
        service.convertJsonToQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Unsupported query type');
    }

  });

  it('should be able to throw an error if it is an Invalid language', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'ABC',
        query_type: 'SELECT',
    };

    try {
        service.convertJsonToQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Invalid language');
    }

  });

  it('should be able to convert queries using pagination and a where condition', () => {
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users',
            columns: [
                { name: 'id' },
                { name: 'first_name' },
                { name: 'last_name' }
            ]
        },
        condition: {
            column: 'age',
            operator: ComparisonOperator.GREATER_THAN,
            value: 18
        } as unknown as compoundCondition,
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name" FROM "users" WHERE "age" > 18 LIMIT 10 OFFSET 20';
    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);
  });

  it('should be able to convert queries using pagination, group by, and having conditions', () => {
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users',
            columns: [
                { name: 'id' },
                { name: 'first_name' },
                { name: 'last_name' },
                { name: 'age', aggregation: AggregateFunction.AVG }
            ]
        },
        condition: {
            column: 'age',
            tableName: 'users',
            operator: ComparisonOperator.GREATER_THAN,
            value: 18,
            aggregate: AggregateFunction.AVG // Adding aggregate function in the condition
        } as unknown as compoundCondition,
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name", AVG("users"."age") AS "AVG(age)" FROM "users" GROUP BY "users"."id", "users"."first_name", "users"."last_name" HAVING AVG("users"."age") > 18 LIMIT 10 OFFSET 20';
    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);
  });

  it('should be able to convert queries using pagination, group by, and where conditions', () => {
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users',
            columns: [
                { name: 'id' },
                { name: 'first_name' },
                { name: 'last_name' },
                { name: 'age' }
            ]
        },
        condition: {
            column: 'age',
            operator: ComparisonOperator.GREATER_THAN,
            value: 18
        } as unknown as compoundCondition,
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT "users"."id", "users"."first_name", "users"."last_name", "users"."age" FROM "users" WHERE "age" > 18 LIMIT 10 OFFSET 20';
    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);
  });

  it('Should be able to convert a query with a join and a having, with aggregate in first table', () => {
    const jsonData: QueryParams = {
        language: "postgresql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "city",
            columns: [{
                name: "city_id",
                aggregation: AggregateFunction.COUNT,
                alias: "Number of cities per country"
            }],
            join: {
                table1MatchingColumnName: "country_id",
                table2MatchingColumnName: "country_id",
                table2: {
                    name: "country",
                    columns: [{ name: "country" }]
                }
            }
        },
        condition: {
            column: "city_id",
            tableName: "city",
            operator: ">",
            value: 10,
            aggregate: "COUNT"
        } as primitiveCondition,

    }

    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual('SELECT COUNT("city"."city_id") AS "Number of cities per country", "country"."country" FROM "city" JOIN "country" ON "city"."country_id"="country"."country_id" GROUP BY "country"."country" HAVING COUNT("city"."city_id") > 10');

  });

  it('Should be able to convert a query with a join and a having, with aggregate in second table', () => {
    const jsonData: QueryParams = {
        language: "postgresql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "country",
            columns: [{ name: "country" }],
            join: {
                table1MatchingColumnName: "country_id",
                table2MatchingColumnName: "country_id",
                table2: {
                    name: "city",
                    columns: [{
                        name: "city_id",
                        aggregation: AggregateFunction.COUNT,
                        alias: "Number of cities per country"
                    }]
                }
            }
        },
        condition: {
            column: "city_id",
            tableName: "city",
            operator: ">",
            value: 10,
            aggregate: "COUNT"
        } as primitiveCondition,

    }

    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual('SELECT "country"."country", COUNT("city"."city_id") AS "Number of cities per country" FROM "country" JOIN "city" ON "country"."country_id"="city"."country_id" GROUP BY "country"."country" HAVING COUNT("city"."city_id") > 10');

  });

  it('Should not return GroupBY if there is no aggregates', () => {
    const jsonData: QueryParams = {
        language: "postgresql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "city",
            columns: [{
                name: "city_id",
            }],
            join: {
                table1MatchingColumnName: "country_id",
                table2MatchingColumnName: "country_id",
                table2: {
                    name: "country",
                    columns: [{ name: "country" }]
                }
            }
        },
        condition: {
            column: "city_id",
            operator: ">",
            value: 10,
        } as primitiveCondition,

    }
    const result = service.convertJsonToQuery(jsonData);
    expect(result).toEqual('SELECT "city"."city_id", "country"."country" FROM "city" JOIN "country" ON "city"."country_id"="country"."country_id" WHERE "city_id" > 10');
  });

  it('Should convert a query finding country names starting with B', () => {
    const jsonData: QueryParams = {
        language: "postgresql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "country",
            columns: [{ name: "country" }]
        },
        condition: {
            column: "country",
            operator: "LIKE",
            value: "B%"
        } as primitiveCondition,

    }

    const result = service.convertJsonToQuery(jsonData);

    expect(result).toEqual('SELECT "country"."country" FROM "country" WHERE "country" LIKE \'B%\'');

  });

  //----------------------------------- Complete count query conversion tests -----------------------------------//

  it('should be able to generate a count query for a query using pagination, group by, and having conditions', () => {
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users',
            columns: [
                { name: 'id' },
                { name: 'first_name' },
                { name: 'last_name' },
                { name: 'age', aggregation: AggregateFunction.AVG }
            ]
        },
        condition: {
            column: 'age',
            tableName: 'users',
            operator: ComparisonOperator.GREATER_THAN,
            value: 18,
            aggregate: AggregateFunction.AVG // Adding aggregate function in the condition
        } as primitiveCondition,
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT COUNT(*) AS numRows FROM (SELECT "users"."id", "users"."first_name", "users"."last_name", AVG("users"."age") AS "AVG(age)" FROM "users" GROUP BY "users"."id", "users"."first_name", "users"."last_name" HAVING AVG("users"."age") > 18) AS subquery';
    const result = service.convertJsonToCountQuery(queryParams);

    expect(result).toEqual(expectedQuery);
  });

  it('Should be able to generate a count query for a query with a join and a having, with aggregate in first table', () => {
    const jsonData: QueryParams = {
        language: "postgresql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "city",
            columns: [{
                name: "city_id",
                aggregation: AggregateFunction.COUNT,
                alias: "Number of cities per country"
            }],
            join: {
                table1MatchingColumnName: "country_id",
                table2MatchingColumnName: "country_id",
                table2: {
                    name: "country",
                    columns: [{ name: "country" }]
                }
            }
        },
        condition: {
            column: "city_id",
            tableName: "city",
            operator: ">",
            value: 10,
            aggregate: "COUNT"
        } as primitiveCondition,

    }

    const result = service.convertJsonToCountQuery(jsonData);

    expect(result).toEqual('SELECT COUNT(*) AS numRows FROM (SELECT COUNT("city"."city_id") AS "Number of cities per country", "country"."country" FROM "city" JOIN "country" ON "city"."country_id"="country"."country_id" GROUP BY "country"."country" HAVING COUNT("city"."city_id") > 10) AS subquery');

  });

  it('should be able to throw an error if mandatory fields are missing', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'SELECT',
    };

    try {
        service.convertJsonToCountQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Invalid query');
    }

  });

  it('should be able to throw an error if it is an unsupported query type', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'postgresql',
        query_type: 'UPDATE',
    };

    try {
        service.convertJsonToCountQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Unsupported query type');
    }

  });

  it('should be able to throw an error if it is an Invalid language', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'ABC',
        query_type: 'SELECT',
    };

    try {
        service.convertJsonToCountQuery(queryParams)
    }
    catch (e) {
        expect(e.message).toBe('Invalid language');
    }

  });

});
