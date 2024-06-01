import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterController } from './jsonConverter.controller';

describe('JsonConverterController', () => {
  let controller: JsonConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonConverterController],
    }).compile();

    controller = module.get<JsonConverterController>(JsonConverterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
