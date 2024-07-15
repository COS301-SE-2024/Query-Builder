import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './jsonConverter.service';
import { AggregateFunction } from '../interfaces/intermediateJSON';

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

  it('should be able to select all columns from a database', () => {

    const queryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        table: {name: 'users', columns: []},
      };
  
      const expectedQuery = 'SELECT `users`.* FROM `users`';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

  it('should be able to select certain columns from a database', () => {

    const queryParams = {
        language: 'SQL',
        query_type: 'SELECT',
        table: {name: 'users', columns: [{name: 'id'}]},
      };
  
      const expectedQuery = 'SELECT `users`.`id` FROM `users`';
  
      const result = service.convertJsonToQuery(queryParams);
  
      expect(result).toEqual(expectedQuery);

  });

});