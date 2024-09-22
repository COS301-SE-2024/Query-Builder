import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';

describe('DbMetadataHandlerController', () => {

  let controller: DbMetadataHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbMetadataHandlerController],
      providers: [
        {
          provide: 'DbMetadataHandlerService',
          useValue: {

          }
        }
      ]
    }).compile();

    controller = module.get<DbMetadataHandlerController>(
      DbMetadataHandlerController
    );

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
});
