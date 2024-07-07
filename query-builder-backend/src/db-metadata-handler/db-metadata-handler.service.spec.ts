import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerService } from './db-metadata-handler.service';

describe('DbMetadataHandlerService', () => {
  let service: DbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbMetadataHandlerService],
    }).compile();

    service = module.get<DbMetadataHandlerService>(DbMetadataHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
