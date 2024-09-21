import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';
import OpenAI from 'openai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { response } from 'express';
import { stringify } from 'querystring';
import { AppService } from '../app.service';

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        apiKey: '0000',
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: {name: "sakila"} } }]
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
                            { message: { content: {name: "sakila"} } }
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

describe('NaturalLanguageService', () => {
  let service: NaturalLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaturalLanguageService,
        ConfigService,
        AppService,
        {
          provide: 'DbMetadataHandlerService',
          useValue: {
            getServerSummary(databaseServerID: string, language: string){return {}}
          }
        }
      ]
    }).compile();

    service = await module.resolve<NaturalLanguageService>(
      NaturalLanguageService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('query', () => {

    describe('gemini', () => {
      it('should return openAI response', async () => {
        expect(
          await service.query(
            { llm: 'gemini', query: 'test', databaseServerID: '0000', language: 'mysql' },
            {}
          )
        ).toStrictEqual({
          databaseServerID: '0000',
          queryParams: {
            choices: [{ message: { content: {name: "sakila"} } }]
          }
        });
      });
    });
  });
});
