import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterController } from './json-converter.controller';
import { MongoJsonConverterService } from './mongo-json-converter/mongo-json-converter.service';
import { MysqlJsonConverterService } from './mysql-json-converter/mysql-json-converter.service';
import { PostgresJsonConverterService } from './postgres-json-converter/postgres-json-converter.service';

describe('JsonConverterController', () => {
  let controller: JsonConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonConverterController],
      providers: [MongoJsonConverterService, MysqlJsonConverterService, PostgresJsonConverterService]
    }).compile();

    controller = module.get<JsonConverterController>(JsonConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to return a basic query correctly converted into SQL', async () => {
    const queryParams = {
      language: 'SQL',
      query_type: 'SELECT',
      databaseName: 'sakila',
      table: { name: 'users', columns: [{ name: 'id' }] }
    };

    const expectedQuery = 'SELECT `users`.`id` FROM `sakila`.`users`';

    const result = controller.convert(queryParams);

    expect(result).toEqual(expectedQuery);
  });
});
