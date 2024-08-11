import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';
import OpenAI from 'openai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { response } from 'express';
import { stringify } from 'querystring';

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        apiKey: '0000',
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Hello, I am an AI' } }]
            })
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
            generateContent: jest.fn().mockImplementation(() => {
              return {
                response: {
                  text: jest.fn().mockImplementation(() => {
                    return {
                      replaceAll: jest.fn().mockReturnValue(
                        JSON.stringify({
                          choices: [
                            { message: { content: 'Hello, I am an AI' } }
                          ]
                        })
                      )
                    };
                  })
                }
              };
            })
          };
        })
      };
    })
  };
});

jest.mock('../db-metadata-handler/db-metadata-handler.service', () => {
  return {
    DbMetadataHandlerService: jest.fn().mockImplementation(() => {
      return {
        getSchemaSummary: jest.fn().mockResolvedValue({
          // mocked value for getSchemaSummary
          databaseServerID: '0000'
        })
      };
    })
  };
});

describe('NaturalLanguageService', () => {
  let service: NaturalLanguageService;
  let mockedOpenAI: jest.Mocked<typeof OpenAI>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule],
      providers: [NaturalLanguageService, ConfigService]
    }).compile();

    service = await module.resolve<NaturalLanguageService>(
      NaturalLanguageService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('query', () => {
    describe('openAI', () => {
      it('should return openAI response', async () => {
        expect(
          await service.query(
            { llm: 'openAI', query: 'test', databaseServerID: '0000' },
            {}
          )
        ).toStrictEqual({
          choices: [{ message: { content: 'Hello, I am an AI' } }]
        });
      });
    });

    describe('gemini', () => {
      it('should return openAI response', async () => {
        expect(
          await service.query(
            { llm: 'gemini', query: 'test', databaseServerID: '0000' },
            {}
          )
        ).toStrictEqual({
          databaseServerID: '0000',
          queryParams: {
            choices: [{ message: { content: 'Hello, I am an AI' } }]
          }
        });
      });
    });
  });
});
