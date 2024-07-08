import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service';

describe('DbMetadataHandlerService', () => {
  let service: DbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbMetadataHandlerService, QueryHandlerService, JsonConverterService],
    }).compile();

    service = module.get<DbMetadataHandlerService>(DbMetadataHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
