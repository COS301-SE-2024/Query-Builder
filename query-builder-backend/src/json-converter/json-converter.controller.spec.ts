import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterController } from './json-converter.controller';
import { MongoJsonConverterService } from './mongo-json-converter/mongo-json-converter.service';
import { MysqlJsonConverterService } from './mysql-json-converter/mysql-json-converter.service';
import { PostgresJsonConverterService } from './postgres-json-converter/postgres-json-converter.service';
import { JsonConverterService } from './json-converter.service';
import { QueryParams } from '../interfaces/dto/query.dto';

describe('JsonConverterController', () => {
  let controller: JsonConverterController;

  describe('with mysql provider', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [JsonConverterController],
        providers: [
          { provide: JsonConverterService, useClass: MysqlJsonConverterService }
        ]
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
});
