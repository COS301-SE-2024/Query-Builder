import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NaturalLanguageController],
    }).compile();

    controller = module.get<NaturalLanguageController>(NaturalLanguageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
