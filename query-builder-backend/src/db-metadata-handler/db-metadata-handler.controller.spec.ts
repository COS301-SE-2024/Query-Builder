import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service';
import { SessionStore } from '../session-store/session-store.service';

describe('DbMetadataHandlerController', () => {
  let controller: DbMetadataHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbMetadataHandlerController],
      providers: [DbMetadataHandlerService, QueryHandlerService, JsonConverterService, SessionStore]
    }).compile();

    controller = module.get<DbMetadataHandlerController>(DbMetadataHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
