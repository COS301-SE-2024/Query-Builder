import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerService } from './query-handler.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { JsonConverterModule } from '../jsonConverter/jsonConverter.module';
import { ConnectionManagerModule } from '../connection-manager/connection-manager.module';

describe('QueryHandlerService', () => {
  let service: QueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JsonConverterModule, ConnectionManagerModule],
      providers: [QueryHandlerService],
    }).compile();

    service = module.get<QueryHandlerService>(QueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
