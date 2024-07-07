import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';

describe('DbMetadataHandlerController', () => {
  let controller: DbMetadataHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbMetadataHandlerController],
    }).compile();

    controller = module.get<DbMetadataHandlerController>(DbMetadataHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
