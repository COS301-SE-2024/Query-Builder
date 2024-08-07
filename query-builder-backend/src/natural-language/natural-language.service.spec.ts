import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageService } from './natural-language.service';

describe('NaturalLanguageService', () => {
  let service: NaturalLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NaturalLanguageService],
    }).compile();

    service = module.get<NaturalLanguageService>(NaturalLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
