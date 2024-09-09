import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './json-converter.service';

describe('JsonConverterService', () => {
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
});
