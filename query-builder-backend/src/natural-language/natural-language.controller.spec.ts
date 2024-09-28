import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { DbMetadataHandlerModule } from './../db-metadata-handler/db-metadata-handler.module';
import { MyLoggerModule } from './../my-logger/my-logger.module';

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule, MyLoggerModule],
      controllers: [NaturalLanguageController],
      providers: [NaturalLanguageService],
    }).compile();

    controller = module.get<NaturalLanguageController>(NaturalLanguageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});