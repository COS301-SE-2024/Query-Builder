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