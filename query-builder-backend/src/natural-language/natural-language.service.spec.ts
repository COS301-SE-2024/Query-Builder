import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';

describe('NaturalLanguageService', () => {
  let service: NaturalLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule],
      providers: [NaturalLanguageService, ConfigService],
    }).compile();

    service = module.get<NaturalLanguageService>(NaturalLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
