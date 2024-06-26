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

  it('should return a JSON object containing SELECT, FROM, and WHERE', async () => {
    const queryParams = {
      language: 'SQL',
      query_type: 'SELECT',
      table: 'users',
      columns: ['id'],
      condition: 'id = 1',
    };

    const expectedQuery = 'SELECT `id` FROM users WHERE id = 1';

    const result = await controller.convert(queryParams);

    expect(result).toContain('SELECT');
    expect(result).toContain('FROM');
    expect(result).toContain('WHERE');
    expect(result).toEqual(expectedQuery);
  });
});