import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerService } from './query-handler.service';

describe('QueryHandlerService', () => {
  let service: QueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryHandlerService],
    }).compile();

    service = module.get<QueryHandlerService>(QueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
