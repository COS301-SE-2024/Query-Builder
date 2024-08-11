import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;

  const mockNaturalLanguageService = {
    query: jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Hello, I am an AI' } }]
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule],
      controllers: [NaturalLanguageController],
      providers: [
        {
          provide: NaturalLanguageService,
          useValue: mockNaturalLanguageService
        },
        ConfigService
      ]
    }).compile();

    controller = module.get<NaturalLanguageController>(
      NaturalLanguageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('query', () => {
    it('should return ai response', async () => {
      expect(
        await controller.getSchemaMetadata(
          { llm: 'openAI', query: 'test', databaseServerID: '0000' },
          {}
        )
      ).toStrictEqual({
        choices: [{ message: { content: 'Hello, I am an AI' } }]
      });
    });
  });
});
