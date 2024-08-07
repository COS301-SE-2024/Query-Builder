import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';

describe('DbMetadataHandlerService', () => {
  let service: DbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [QueryHandlerModule],
      providers: [DbMetadataHandlerService]
    }).compile();

    service = module.get<DbMetadataHandlerService>(DbMetadataHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
