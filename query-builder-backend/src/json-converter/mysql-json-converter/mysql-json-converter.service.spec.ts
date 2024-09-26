import { Test, TestingModule } from '@nestjs/testing';
import { MysqlJsonConverterService } from './mysql-json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';
import {
  AggregateFunction,
  ComparisonOperator,
  compoundCondition,
  primitiveCondition,
  condition
} from '../../interfaces/dto/conditions.dto';

describe('MysqlJsonConverterService', () => {
  let service: MysqlJsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MysqlJsonConverterService]
    }).compile();

    service = module.get<MysqlJsonConverterService>(MysqlJsonConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //------------------------------------- Individual functions tests -------------------------------------//

  //conditionWhereSQLHelp()

  it('should return an empty string if the condition is null', () => {
      expect(service.conditionWhereSQLHelp(null)).toEqual({queryString: "", parameters: []});
  });

  it('should return an empty string if the condition is undefined', () => {
      expect(service.conditionWhereSQLHelp(undefined)).toEqual({queryString: "", parameters: []});
  });

  it('should handle boolean true values correctly', () => {
      const condition = {
          column: 'is_active',
          operator: '=',
          value: true, // Boolean true value
      } as primitiveCondition;

      const result = service.conditionWhereSQLHelp(condition);
      expect(result).toEqual({queryString: '`is_active` = ?', parameters: [true]});
  });

  it('should handle boolean false values correctly', () => {
      const condition = {
          column: 'is_active',
          operator: '=',
          value: false, // Boolean false value
      } as primitiveCondition;

      const result = service.conditionWhereSQLHelp(condition);
      expect(result).toEqual({queryString: '`is_active` = ?', parameters: [false]});
  });

  //conditionWhereSQL()

  it('should be able to convert primitive conditions', () => {

      const condition = {
          column: "name",
          operator: "=",
          value: "value"
      } as primitiveCondition;

      const result = service.conditionWhereSQL(condition);

      expect(result).toEqual({queryString: " WHERE `name` = ?", parameters: ["value"]});

  });

  it('should be able to convert compound conditions', () => {

      const condition = {
          conditions: [
              {
                  column: "name",
                  operator: "=",
                  value: "value"
              },
              {
                  column: "age",
                  operator: ">",
                  value: 18
              }
          ],
          operator: "AND"
      } as unknown as compoundCondition;

      const result = service.conditionWhereSQL(condition);

      expect(result).toEqual({queryString: " WHERE (`name` = ? AND `age` > ?)", parameters: ["value", 18]});

  });

  it('should be able to convert compound conditions with AND and OR', () => {

      const condition = {
          conditions: [
              {
                  column: "name",
                  operator: "=",
                  value: "value"
              },
              {
                  column: "age",
                  operator: ">",
                  value: 18
              },
              {
                  conditions: [
                      {
                          column: "city",
                          operator: "=",
                          value: "New York"
                      },
                      {
                          column: "status",
                          operator: "!=",
                          value: "inactive"
                      }
                  ],
                  operator: "OR"
              }
          ],
          operator: "AND"
      } as unknown as compoundCondition;

      const result = service.conditionWhereSQL(condition);

      expect(result).toEqual({
        queryString: " WHERE (`name` = ? AND `age` > ? AND (`city` = ? OR `status` != ?))",
        parameters: ["value", 18, "New York", "inactive"]
    });

  });


  it('should return an empty string if no condition is provided', () => {

      const result = service.conditionWhereSQL(null);

      expect(result).toEqual({queryString: "", parameters: []});

  });

  //getAggregateConditions()

  it('should return SQL for a simple aggregate condition', () => {
      const condition = {
          aggregate: "SUM",
          column: "salary",
          operator: ">",
          value: 50000
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);

      expect(result).toEqual([{queryString: "SUM(`salary`) > ?", parameters: [50000]}]);
  });

  it('should return SQL for compound aggregate conditions', () => {
      const condition = {
          conditions: [
              {
                  aggregate: "SUM",
                  column: "salary",
                  operator: ">",
                  value: 50000
              },
              {
                  aggregate: "COUNT",
                  column: "id",
                  operator: ">",
                  value: 10
              }
          ],
          operator: "AND"
      } as unknown as compoundCondition;

      const result = service.getAggregateConditions(condition);

      expect(result).toEqual([{queryString: "SUM(`salary`) > ?", parameters: [50000]}, {queryString: "COUNT(`id`) > ?", parameters: [10]}]);
  });

  it('should handle string values correctly with table name', () => {
      const condition = {
          column: 'status',
          aggregate: 'COUNT',
          tableName: 'users',
          operator: '=',
          value: 'active', // String value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `COUNT(\`users\`.\`status\`) = ?`, parameters: ["active"]}]);
  });

  it('should handle string values correctly without table name', () => {
      const condition = {
          column: 'status',
          aggregate: 'MAX',
          operator: '=',
          value: 'inactive', // String value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `MAX(\`status\`) = ?`, parameters: ["inactive"]}]);
  });

  it('should handle boolean true values correctly with table name', () => {
      const condition = {
          column: 'is_active',
          aggregate: 'SUM',
          tableName: 'users',
          operator: '=',
          value: true, // Boolean true value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `SUM(\`users\`.\`is_active\`) = ?`, parameters: [true]}]);
  });

  it('should handle boolean false values correctly with table name', () => {
      const condition = {
          column: 'is_active',
          aggregate: 'COUNT',
          tableName: 'users',
          operator: '=',
          value: false, // Boolean false value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `COUNT(\`users\`.\`is_active\`) = ?`, parameters: [false]}]);
  });

  it('should handle boolean true values correctly without table name', () => {
      const condition = {
          column: 'is_active',
          aggregate: 'AVG',
          operator: '=',
          value: true, // Boolean true value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `AVG(\`is_active\`) = ?`, parameters: [true]}]);
  });

  it('should handle boolean false values correctly without table name', () => {
      const condition = {
          column: 'is_active',
          aggregate: 'MAX',
          operator: '=',
          value: false, // Boolean false value
      } as primitiveCondition;

      const result = service.getAggregateConditions(condition);
      expect(result).toEqual([{queryString: `MAX(\`is_active\`) = ?`, parameters: [false]}]);
  });

  //havingSQL()

  it('should return empty string when no having conditions are present', () => {
      const jsonData: QueryParams = {
          language: "mysql",
          query_type: "SELECT",
          databaseName: "sakila",
          table: {
              name: "test_table",
              columns: [
                  { name: "id", aggregation: null }
              ]
          },
          condition: null
      };

      const result = service.havingSQL(jsonData);

      expect(result).toEqual({queryString: "", parameters: []});
  });

  //groupBySQL()

  it('should return empty string when no group by columns are present', () => {
      const jsonData: QueryParams = {
          language: "mysql",
          query_type: "SELECT",
          databaseName: "sakila",
          table: {
              name: "test_table",
              columns: [
                  { name: "id", aggregation: AggregateFunction.COUNT },
                  { name: "name", aggregation: AggregateFunction.COUNT }
              ]
          }
      };

      const result = service.groupBySQL(jsonData);

      expect(result).toEqual('');
  });

  it('should return GROUP BY clause for columns without aggregation', () => {
      const jsonData: QueryParams = {
          language: "mysql",
          query_type: "SELECT",
          databaseName: "sakila",
          table: {
              name: "test_table",
              columns: [
                  { name: "id", aggregation: null },
                  { name: "name", aggregation: AggregateFunction.COUNT },
                  { name: "age", aggregation: null }
              ]
          }
      };

      const result = service.groupBySQL(jsonData);

      expect(result).toEqual(' GROUP BY `test_table`.`id`, `test_table`.`age`');
  });

  //------------------------------------- Complete query conversion tests -------------------------------------//

  it('should report an error when no columns are specified for a table', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
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
          language: 'mysql',
          query_type: 'SELECT',
          databaseName: "sakila",
          table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
      };

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `sakila`.`users`';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to convert queries with aggregation and aliasing', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
          query_type: 'SELECT',
          databaseName: "sakila",
          table: { name: 'users', columns: [{ name: 'id', aggregation: AggregateFunction.COUNT, alias: "Number" }] },
      };

      const expectedQueryString = 'SELECT COUNT(`users`.`id`) AS `Number` FROM `sakila`.`users`';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to convert queries with joins', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
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

      const expectedQueryString = 'SELECT `users`.`id`, `actors`.`role` FROM `sakila`.`users` JOIN `sakila`.`actors` ON `users`.`id`=`actors`.`user_id`';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to convert queries with sorting in descending order', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
          query_type: 'SELECT',
          databaseName: "sakila",
          table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
          sortParams: {
              column: 'first_name',
              direction: "descending"
          }
      };

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `sakila`.`users` ORDER BY `first_name` DESC';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to convert queries with sorting in ascending order', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
          query_type: 'SELECT',
          databaseName: "sakila",
          table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
          sortParams: {
              column: 'first_name'
          }
      };

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `sakila`.`users` ORDER BY `first_name` ASC';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to convert queries using pagination', () => {

      const queryParams: QueryParams = {
          language: 'mysql',
          query_type: 'SELECT',
          databaseName: "sakila",
          table: { name: 'users', columns: [{ name: 'id' }, { name: "first_name" }, { name: "last_name" }] },
          pageParams: {
              pageNumber: 3,
              rowsPerPage: 10
          }
      };

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `sakila`.`users` LIMIT 10 OFFSET 20';

      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: []});

  });

  it('should be able to throw an error if mandatory fields are missing', () => {

      // @ts-ignore
      const queryParams: QueryParams = {
          language: 'mysql',
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
          language: 'mysql',
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
          language: 'mysql',
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

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `sakila`.`users` WHERE `age` > ? LIMIT 10 OFFSET 20';
      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: [18]});
  });

  it('should be able to convert queries using pagination, group by, and having conditions', () => {
      const queryParams: QueryParams = {
          language: 'mysql',
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

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name`, AVG(`users`.`age`) AS `AVG(age)` FROM `sakila`.`users` GROUP BY `users`.`id`, `users`.`first_name`, `users`.`last_name` HAVING AVG(`users`.`age`) > ? LIMIT 10 OFFSET 20';
      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: [18]});
  });

  it('should be able to convert queries using pagination, group by, and where conditions', () => {
      const queryParams: QueryParams = {
          language: 'mysql',
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

      const expectedQueryString = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name`, `users`.`age` FROM `sakila`.`users` WHERE `age` > ? LIMIT 10 OFFSET 20';
      const result = service.convertJsonToQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: [18]});
  });

  it('Should be able to convert a query with a join and a having, with aggregate in first table', () => {
      const jsonData: QueryParams = {
          language: "mysql",
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

      expect(result).toEqual({queryString: 'SELECT COUNT(`city`.`city_id`) AS `Number of cities per country`, `country`.`country` FROM `sakila`.`city` JOIN `sakila`.`country` ON `city`.`country_id`=`country`.`country_id` GROUP BY `country`.`country` HAVING COUNT(`city`.`city_id`) > ?', parameters: [10]});

  });

  it('Should be able to convert a query with a join and a having, with aggregate in second table', () => {
      const jsonData: QueryParams = {
          language: "mysql",
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

      expect(result).toEqual({queryString: 'SELECT `country`.`country`, COUNT(`city`.`city_id`) AS `Number of cities per country` FROM `sakila`.`country` JOIN `sakila`.`city` ON `country`.`country_id`=`city`.`country_id` GROUP BY `country`.`country` HAVING COUNT(`city`.`city_id`) > ?', parameters: [10]});

  });

  it('Should not return GroupBY if there is no aggregates', () => {
      const jsonData: QueryParams = {
          language: "mysql",
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
      expect(result).toEqual({queryString: 'SELECT `city`.`city_id`, `country`.`country` FROM `sakila`.`city` JOIN `sakila`.`country` ON `city`.`country_id`=`country`.`country_id` WHERE `city_id` > ?', parameters: [10]});
  });

  it('Should convert a query finding country names starting with B', () => {
      const jsonData: QueryParams = {
          language: "mysql",
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

      expect(result).toEqual({queryString: "SELECT `country`.`country` FROM `sakila`.`country` WHERE `country` LIKE ?", parameters: ["B%"]});

  });

  //----------------------------------- Complete count query conversion tests -----------------------------------//

  it('should be able to generate a count query for a query using pagination, group by, and having conditions', () => {
      const queryParams: QueryParams = {
          language: 'mysql',
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

      const expectedQueryString = 'SELECT COUNT(*) AS numRows FROM (SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name`, AVG(`users`.`age`) AS `AVG(age)` FROM `sakila`.`users` GROUP BY `users`.`id`, `users`.`first_name`, `users`.`last_name` HAVING AVG(`users`.`age`) > ?) AS subquery';
      const result = service.convertJsonToCountQuery(queryParams);

      expect(result).toEqual({queryString: expectedQueryString, parameters: [18]});
  });

  it('Should be able to generate a count query for a query with a join and a having, with aggregate in first table', () => {
      const jsonData: QueryParams = {
          language: "mysql",
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

      expect(result).toEqual({queryString: 'SELECT COUNT(*) AS numRows FROM (SELECT COUNT(`city`.`city_id`) AS `Number of cities per country`, `country`.`country` FROM `sakila`.`city` JOIN `sakila`.`country` ON `city`.`country_id`=`country`.`country_id` GROUP BY `country`.`country` HAVING COUNT(`city`.`city_id`) > ?) AS subquery', parameters: [10]});

  });

  it('should be able to throw an error if mandatory fields are missing', () => {

      // @ts-ignore
      const queryParams: QueryParams = {
          language: 'mysql',
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
          language: 'mysql',
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