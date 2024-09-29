import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { BadRequestException } from '@nestjs/common';
import { Query } from './../interfaces/dto/query.dto';

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn()
          }
        }
      };
    })
  };
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          // mocked value for GenerativeModel
          return {
            generateContent: jest.fn()
          };
        })
      };
    })
  };
});

describe('NaturalLanguageService', () => {
  let service: NaturalLanguageService;
  let openAiService: OpenAI;
  let geminiModel: GenerativeModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      providers: [
        NaturalLanguageService,
        ConfigService,
        AppService,
        {
          provide: 'DbMetadataHandlerService',
          useValue: {
            getServerSummary(databaseServerID: string, language: string) {
              return {databaseServerID: '0000'}
            }
          }
        }
      ]
    }).compile();

    service = module.get<NaturalLanguageService>(NaturalLanguageService);
    openAiService = service['openAiService'];
    geminiModel = service['geminiModel'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a valid query object from open_ai_query', async () => {
    const naturalLanguageQuery = {
      databaseServerID: '0000',
      query: 'Give me all the actors with the first name Nick',
      language: 'mysql',
      llm: 'openAI'
    };
    const session = {};

    const query = {
      databaseServerID: '0000',
      queryParams: {
        databaseName: 'sakila',
        table: {
          name: 'actor',
          columns: [{ name: 'first_name' }, { name: 'last_name' }]
        },
        condition: {
          conditions: [
            {
              tableName: 'actor',
              column: 'first_name',
              operator: '=',
              value: 'Nick'
            }
          ],
          operator: 'AND'
        }
      }
    };

    jest.spyOn(openAiService.chat.completions, 'create').mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(query.queryParams)
          }
        }
      ]
    } as any);
    
    const result = await service.naturalLanguageQuery(naturalLanguageQuery, session);

    expect(result).toEqual({
      ...query,
      queryParams: {
        ...query.queryParams,
        language: 'mysql',
        query_type: 'select'
      }
    });
  });

  it('should return a valid query object from gemini_query', async () => {
    const naturalLanguageQuery = {
      databaseServerID: '0000',
      query: 'Give me country names starting with B',
      language: 'mysql',
      llm: 'gemini'
    };
    const session = {};

    const query = {
      databaseServerID: '0000',
      queryParams: {
        databaseName: 'sakila',
        table: {
          name: 'actor',
          columns: [{ name: 'first_name' }, { name: 'last_name' }]
        },
        condition: {
          conditions: [
            {
              tableName: 'actor',
              column: 'first_name',
              operator: '=',
              value: 'Nick'
            }
          ],
          operator: 'AND'
        }
      }
    };

    jest.spyOn(geminiModel, 'generateContent').mockResolvedValue({
      response: {
        text: jest.fn().mockResolvedValue(JSON.stringify(query.queryParams))
      }
    } as any);

    const result = await service.naturalLanguageQuery(naturalLanguageQuery, session);

    expect(result).toEqual({
      ...query,
      queryParams: {
        ...query.queryParams,
        language: 'mysql',
        query_type: 'select'
      }
    });
  });

  it('should throw BadRequestException for invalid JSON format in open_ai_query', async () => {
    jest
      .spyOn(service['openAiService'].chat.completions, 'create')
      .mockResolvedValue({
        choices: [{ message: { content: 'invalid json' } }]
      } as any);

    const naturalLanguageQuery = {
      databaseServerID: '0000',
      query: 'Give me all the actors with the first name Nick',
      language: 'mysql',
      llm: 'openAI'
    };
    const session = {};

    await expect(
      service.naturalLanguageQuery(naturalLanguageQuery, session)
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid JSON format in gemini_query', async () => {
    jest.spyOn(service['geminiModel'], 'generateContent').mockResolvedValue({
      response: {
        text: jest.fn().mockResolvedValue('invalid json')
      }
    } as any);

    const naturalLanguageQuery = {
      databaseServerID: '0000',
      query: 'Give me country names starting with B',
      language: 'mysql',
      llm: 'gemini'
    };
    const session = {};

    await expect(
      service.naturalLanguageQuery(naturalLanguageQuery, session)
    ).rejects.toThrow(BadRequestException);
  });

});