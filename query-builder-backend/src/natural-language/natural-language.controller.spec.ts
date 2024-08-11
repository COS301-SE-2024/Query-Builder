import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule],
      controllers: [NaturalLanguageController],
      providers: [NaturalLanguageService, ConfigService]
    }).compile();

    controller = module.get<NaturalLanguageController>(NaturalLanguageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
