import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterController } from './jsonConverter.controller';
import { JsonConverterService } from './jsonConverter.service';

describe('JsonConverterController', () => {
  let controller: JsonConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonConverterController],
      providers: [JsonConverterService],
    }).compile();

    controller = module.get<JsonConverterController>(JsonConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should return a JSON object containing SELECT, FROM, and WHERE', async () => {
  //   const queryParams = {
  //     language: 'SQL',
  //     query_type: 'SELECT',
  //     table: 'users',
  //     columns: ['id'],
  //     condition: 'id = 1',
  //   };

  //   const expectedQuery = 'SELECT `id` FROM users WHERE id = 1';

  //   const result = await controller.convert(queryParams);

  //   expect(result).toContain('SELECT');
  //   expect(result).toContain('FROM');
  //   expect(result).toContain('WHERE');
  //   expect(result).toEqual(expectedQuery);
  // });
});





import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './jsonConverter.service';
import { QueryParams, AggregateFunction } from '../interfaces/intermediateJSON';

describe('JSONConverterService', () => {
  let service: JsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonConverterService],
    }).compile();

    service = module.get<JsonConverterService>(JsonConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to convert primitive conditions', () => {
    
    const condition = {
        column: "name",
        operator: "=",
        value: "value"
    }

    const result = service.conditionWhereSQL(condition);

    expect(result).toEqual("name = 'value'");

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
    
        expect(result).toEqual("(name = 'value' AND age > 18)");
    
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
    
        expect(result).toEqual("(name = 'value' AND age > 18 AND (city = 'New York' OR status != 'inactive'))");
    
    });
    

    it('should return an empty string if no condition is provided', () => {
    
        const result = service.conditionWhereSQL(null);
    
        expect(result).toEqual("");
    
    });

    
    
    it('should return SQL for a simple aggregate condition', () => {
        const condition = {
            aggregate: "SUM",
            column: "salary",
            operator: ">",
            value: 50000
        };
    
        const result = service.getAggregateConditions(condition);
    
        expect(result).toEqual(["SUM(salary) > 50000"]);
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
    
        expect(result).toEqual(["SUM(salary) > 50000", "COUNT(id) > 10"]);
    });

    it('should return empty string when no having conditions are present', () => {
        const jsonData: QueryParams = {
            language: "SQL",
            query_type: "SELECT",
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
    

    it('should return empty string when no group by columns are present', () => {
        const jsonData: QueryParams = {
            language: "SQL",
            query_type: "SELECT",
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
    
        expect(result).toEqual(' GROUP BY id, age');
    });




    //--------------------------------------------------------------------------------------


    it('should be able to convert queries with all columns selected', () => {

        const queryParams: QueryParams = {
            language: 'SQL',
            query_type: 'SELECT',
            table: {name: 'users', columns: []},
          };
      
          const expectedQuery = 'SELECT `users`.* FROM `users`';
      
          const result = service.convertJsonToQuery(queryParams);
      
          expect(result).toEqual(expectedQuery);
    
      });
    
      it('should be able to convert queries with multiple columns selected', () => {
    
        const queryParams: QueryParams = {
            language: 'SQL',
            query_type: 'SELECT',
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

});