import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';

describe('DbMetadataHandlerController', () => {
  let controller: DbMetadataHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ QueryHandlerModule ],
      controllers: [DbMetadataHandlerController],
      providers: [DbMetadataHandlerService]
    }).compile();

    controller = module.get<DbMetadataHandlerController>(DbMetadataHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
