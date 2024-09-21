import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './json-converter.service';
import { QueryParams } from '../interfaces/dto/query.dto';

class MockJsonConverterService extends JsonConverterService {
  convertJsonToQuery(query: QueryParams) {
    return JSON.stringify(query);
  }
  convertJsonToCountQuery(jsonData: QueryParams) {
    return JSON.stringify(jsonData);
  }
}

describe('JsonConverterService', () => {
  let service: JsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: JsonConverterService,
        useClass: MockJsonConverterService,
      }],
    }).compile();

    service = module.get<JsonConverterService>(JsonConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a convertJsonToQuery method', () => {
    expect(service.convertJsonToQuery).toBeDefined();
  });
});
