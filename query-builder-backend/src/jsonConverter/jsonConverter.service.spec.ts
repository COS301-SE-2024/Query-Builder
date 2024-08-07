import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './jsonConverter.service';
import { QueryParams, AggregateFunction, ComparisonOperator } from '../interfaces/intermediateJSON';

describe('JSONConverterService', () => {
  let service: JsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonConverterService],
    }).compile();

    service = module.get<JsonConverterService>(JsonConverterService);
  });

  //------------------------------------- Service setup test -------------------------------------//

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //------------------------------------- Individual functions tests -------------------------------------//

    //conditionWhereSQLHelp()

    it('should return an empty string if the condition is null', () => {
        expect(service.conditionWhereSQLHelp(null)).toBe('');
    });

    it('should return an empty string if the condition is undefined', () => {
        expect(service.conditionWhereSQLHelp(undefined)).toBe('');
    });

    it('should handle boolean true values correctly', () => {
        const condition = {
            column: 'is_active',
            operator: '=',
            value: true, // Boolean true value
        };

        const result = service.conditionWhereSQLHelp(condition);
        expect(result).toBe('`is_active` = TRUE');
    });

    it('should handle boolean false values correctly', () => {
        const condition = {
            column: 'is_active',
            operator: '=',
            value: false, // Boolean false value
        };

        const result = service.conditionWhereSQLHelp(condition);
        expect(result).toBe('`is_active` = FALSE');
    });

  //conditionWhereSQL()

  it('should be able to convert primitive conditions', () => {
    
    const condition = {
        column: "name",
        operator: "=",
        value: "value"
    }

    const result = service.conditionWhereSQL(condition);

    expect(result).toEqual(" WHERE `name` = 'value'");

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
        }
    
        const result = service.conditionWhereSQL(condition);
    
        expect(result).toEqual(" WHERE (`name` = 'value' AND `age` > 18)");
    
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
        }
    
        const result = service.conditionWhereSQL(condition);
    
        expect(result).toEqual(" WHERE (`name` = 'value' AND `age` > 18 AND (`city` = 'New York' OR `status` != 'inactive'))");
    
    });
    

    it('should return an empty string if no condition is provided', () => {
    
        const result = service.conditionWhereSQL(null);
    
        expect(result).toEqual("");
    
    });

    //getAggregateConditions()
    
    it('should return SQL for a simple aggregate condition', () => {
        const condition = {
            aggregate: "SUM",
            column: "salary",
            operator: ">",
            value: 50000
        };
    
        const result = service.getAggregateConditions(condition);
    
        expect(result).toEqual(["SUM(`salary`) > 50000"]);
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
        };
    
        const result = service.getAggregateConditions(condition);
    
        expect(result).toEqual(["SUM(`salary`) > 50000", "COUNT(`id`) > 10"]);
    });

    it('should handle string values correctly with table name', () => {
        const condition = {
            column: 'status',
            aggregate: 'COUNT',
            tableName: 'users',
            operator: '=',
            value: 'active', // String value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`COUNT(\`users\`.\`status\`) = 'active'`]);
    });

    it('should handle string values correctly without table name', () => {
        const condition = {
            column: 'status',
            aggregate: 'MAX',
            operator: '=',
            value: 'inactive', // String value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`MAX(\`status\`) = 'inactive'`]);
    });

    it('should handle boolean true values correctly with table name', () => {
        const condition = {
            column: 'is_active',
            aggregate: 'SUM',
            tableName: 'users',
            operator: '=',
            value: true, // Boolean true value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`SUM(\`users\`.\`is_active\`) = TRUE`]);
    });

    it('should handle boolean false values correctly with table name', () => {
        const condition = {
            column: 'is_active',
            aggregate: 'COUNT',
            tableName: 'users',
            operator: '=',
            value: false, // Boolean false value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`COUNT(\`users\`.\`is_active\`) = FALSE`]);
    });

    it('should handle boolean true values correctly without table name', () => {
        const condition = {
            column: 'is_active',
            aggregate: 'AVG',
            operator: '=',
            value: true, // Boolean true value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`AVG(\`is_active\`) = TRUE`]);
    });

    it('should handle boolean false values correctly without table name', () => {
        const condition = {
            column: 'is_active',
            aggregate: 'MAX',
            operator: '=',
            value: false, // Boolean false value
        };

        const result = service.getAggregateConditions(condition);
        expect(result).toEqual([`MAX(\`is_active\`) = FALSE`]);
    });

    //havingSQL()

    it('should return empty string when no having conditions are present', () => {
        const jsonData: QueryParams = {
            language: "SQL",
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
    
        expect(result).toEqual('');
    });

    //groupBySQL()

    it('should return empty string when no group by columns are present', () => {
        const jsonData: QueryParams = {
            language: "SQL",
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
            language: "SQL",
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
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: []},
      };
  
      try{
        service.convertJsonToQuery(queryParams)
      }
      catch(e){
        expect(e.message).toBe("No columns specified for table 'users'");
      }

  });

  it('should be able to convert queries with multiple columns selected', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: [{name: 'id'}, {name: "first_name"}, {name: "last_name"}]},
      };
  
      const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `users`';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with aggregation and aliasing', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: [{name: 'id', aggregation: AggregateFunction.COUNT, alias: "Number"}]},
      };
  
      const expectedQuery = 'SELECT COUNT(`users`.`id`) AS `Number` FROM `users`';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with joins', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {
            name: 'users', 
            columns: [{name: 'id'}],
            join: {
                table1MatchingColumnName: "id",
                table2MatchingColumnName: "user_id",
                table2: {
                    name: "actors",
                    columns: [{name: "role"}]
                }
            }
        },
      };
  
      const expectedQuery = 'SELECT `users`.`id`, `actors`.`role` FROM `users` JOIN `actors` ON `users`.`id`=`actors`.`user_id`';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with sorting in descending order', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: [{name: 'id'}, {name: "first_name"}, {name: "last_name"}]},
        sortParams: {
            column: 'first_name',
            direction: "descending"
        }
      };
  
      const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `users` ORDER BY `first_name` DESC';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries with sorting in ascending order', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: [{name: 'id'}, {name: "first_name"}, {name: "last_name"}]},
        sortParams: {
            column: 'first_name'
        }
      };
  
      const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `users` ORDER BY `first_name` ASC';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to convert queries using pagination', () => {

    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        databaseName: "sakila",
        table: {name: 'users', columns: [{name: 'id'}, {name: "first_name"}, {name: "last_name"}]},
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
      };
  
      const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `users` LIMIT 10 OFFSET 20';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to throw an error if mandatory fields are missing', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'SELECT',
      };

      try{
        service.convertJsonToQuery(queryParams)
      }
      catch(e){
        expect(e.message).toBe('Invalid query');
      }

  });

  it('should be able to throw an error if it is an unsupported query type', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'SQL',
        query_type: 'UPDATE',
      };

      try{
        service.convertJsonToQuery(queryParams)
      }
      catch(e){
        expect(e.message).toBe('Unsupported query type');
      }

  });

  it('should be able to throw an error if it is an Invalid language', () => {

    // @ts-ignore
    const queryParams: QueryParams = {
        language: 'ABC',
        query_type: 'SELECT',
      };

      try{
        service.convertJsonToQuery(queryParams)
      }
      catch(e){
        expect(e.message).toBe('Invalid language');
      }

  });

  it('should be able to convert queries using pagination and a where condition', () => {
    const queryParams: QueryParams = {
        language: 'SQL',
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
        },
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name` FROM `users` WHERE `age` > 18 LIMIT 10 OFFSET 20';
    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);
});

it('should be able to convert queries using pagination, where, group by, and having conditions', () => {
    const queryParams: QueryParams = {
        language: 'SQL',
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
        },
        pageParams: {
            pageNumber: 3,
            rowsPerPage: 10
        }
    };

    const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name`, AVG(`users`.`age`) FROM `users` GROUP BY `users`.`id`, `users`.`first_name`, `users`.`last_name` HAVING AVG(`users`.`age`) > 18 LIMIT 10 OFFSET 20';
    const result = service.convertJsonToQuery(queryParams);

    expect(result).toEqual(expectedQuery);
});

    it('should be able to convert queries using pagination, where, and group by conditions', () => {
        const queryParams: QueryParams = {
            language: 'SQL',
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
            },
            pageParams: {
                pageNumber: 3,
                rowsPerPage: 10
            }
        };

        const expectedQuery = 'SELECT `users`.`id`, `users`.`first_name`, `users`.`last_name`, `users`.`age` FROM `users` WHERE `age` > 18 LIMIT 10 OFFSET 20';
        const result = service.convertJsonToQuery(queryParams);

        expect(result).toEqual(expectedQuery);
    });

    it('Should be able to convert a query with a join and a having, with aggregate in first table', () => {
        const jsonData: QueryParams = {
                "language": "sql",
                "query_type": "select",
                "databaseName": "sakila",
                "table": {
                    "name":"city", 
                    "columns":[{
                        "name": "city_id",
                        "aggregation": AggregateFunction.COUNT,
                        "alias": "Number of cities per country"
                    }],
                    "join": {
                        "table1MatchingColumnName": "country_id",
                        "table2MatchingColumnName": "country_id",
                        "table2": {
                            "name": "country",
                            "columns": [{"name": "country"}]
                        }
                    }
                },
                "condition": {
                    "column": "city_id",
                    "tableName": "city",
                    "operator": ">",
                    "value": 10,
                    "aggregate":"COUNT"
                },

        }

        const result = service.convertJsonToQuery(jsonData);

        expect(result).toEqual('SELECT COUNT(`city`.`city_id`) AS `Number of cities per country`, `country`.`country` FROM `city` JOIN `country` ON `city`.`country_id`=`country`.`country_id` GROUP BY `country`.`country` HAVING COUNT(`city`.`city_id`) > 10');

    });

    it('Should be able to convert a query with a join and a having, with aggregate in second table', () => {
        const jsonData: QueryParams = {
                "language": "sql",
                "query_type": "select",
                "databaseName": "sakila",
                "table": {
                    "name":"country", 
                    "columns":[{"name": "country"}],
                    "join": {
                        "table1MatchingColumnName": "country_id",
                        "table2MatchingColumnName": "country_id",
                        "table2": {
                            "name": "city",
                            "columns": [{
                                "name": "city_id",
                                "aggregation": AggregateFunction.COUNT,
                                "alias": "Number of cities per country"
                            }]
                        }
                    }
                },
                "condition": {
                    "column": "city_id",
                    "tableName": "city",
                    "operator": ">",
                    "value": 10,
                    "aggregate":"COUNT"
                },

        }

        const result = service.convertJsonToQuery(jsonData);

        expect(result).toEqual('SELECT `country`.`country`, COUNT(`city`.`city_id`) AS `Number of cities per country` FROM `country` JOIN `city` ON `country`.`country_id`=`city`.`country_id` GROUP BY `country`.`country` HAVING COUNT(`city`.`city_id`) > 10');

    });

    it('Should not return GroupBY if there is no aggregates', () => {
        const jsonData: QueryParams = {
            "language": "sql",
            "query_type": "select",
            "databaseName": "sakila",
            "table": {
                "name":"city", 
                "columns":[{
                    "name": "city_id",
                }],
                "join": {
                    "table1MatchingColumnName": "country_id",
                    "table2MatchingColumnName": "country_id",
                    "table2": {
                        "name": "country",
                        "columns": [{"name": "country"}]
                    }
                }
            },
            "condition": {
                "column": "city_id",
                "operator": ">",
                "value": 10,
            },

        }
        const result = service.convertJsonToQuery(jsonData);
        expect(result).toEqual('SELECT `city`.`city_id`, `country`.`country` FROM `city` JOIN `country` ON `city`.`country_id`=`country`.`country_id` WHERE `city_id` > 10');
    });

    it('Should convert a query finding country names starting with B', () => {
        const jsonData: QueryParams = {
                "language": "sql",
                "query_type": "select",
                "databaseName": "sakila",
                "table": {
                    "name": "country",
                    "columns": [{"name": "country"}]
                },
                "condition": {
                    "column": "country",
                    "operator": "LIKE",
                    "value": "B%"
                },

        }

        const result = service.convertJsonToQuery(jsonData);

        expect(result).toEqual("SELECT `country`.`country` FROM `country` WHERE `country` LIKE 'B%'");

    });

});