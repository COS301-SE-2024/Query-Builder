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

  it('should be able to return a basic query correctly converted into SQL', async () => {

    const queryParams = {
      language: 'SQL',
      query_type: 'SELECT',
      table: {name: 'users', columns: [{name: 'id'}]},
    };

    const expectedQuery = 'SELECT `users`.`id` FROM `users`';

    const result = controller.convert(queryParams);

    expect(result).toEqual(expectedQuery);

  });
});