import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';
import { AppService } from '../app.service';

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NaturalLanguageController],
      providers: [
        {
          provide: NaturalLanguageService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<NaturalLanguageController>(
      NaturalLanguageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});