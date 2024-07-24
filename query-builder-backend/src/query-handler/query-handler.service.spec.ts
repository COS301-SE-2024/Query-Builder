import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service';
import { SessionStore } from 'src/session-store/session-store.service';

describe('QueryHandlerService', () => {
  let service: QueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryHandlerService, JsonConverterService, SessionStore],
    }).compile();

    service = module.get<QueryHandlerService>(QueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
