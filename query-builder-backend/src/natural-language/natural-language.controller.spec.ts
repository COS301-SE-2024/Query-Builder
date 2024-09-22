import { Test, TestingModule } from '@nestjs/testing';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { ConfigService } from '@nestjs/config';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { Query } from '../interfaces/dto/query.dto';
import { query } from 'express';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('./natural-language.service.ts', () => ({
  NaturalLanguageService: jest.fn().mockImplementation(() => ({
    open_ai_query: jest.fn(),
    gemini_query: jest.fn(),
    validate_Query_DTO: jest.fn(),
    validate_QueryParams_DTO: jest.fn()
  }))
}));

describe('NaturalLanguageController', () => {
  let controller: NaturalLanguageController;
  let service: NaturalLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbMetadataHandlerModule, MyLoggerModule],
      controllers: [NaturalLanguageController],
      providers: [NaturalLanguageService, ConfigService, AppService]
    }).compile();

    controller = module.get<NaturalLanguageController>(
      NaturalLanguageController
    );
    service = module.get<NaturalLanguageService>(NaturalLanguageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return openAI query result when llm is openAI', async () => {
    const result: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    jest.spyOn(service, 'open_ai_query').mockResolvedValue({ query: result });

    const response = await controller.getSchemaMetadata(
      { llm: 'openAI', query: 'some query', databaseServerID: 'someID', language: 'mysql' },
      {}
    );

    expect(response).toBe(result);
    expect(service.open_ai_query).toHaveBeenCalled();
  });

  it('should return gemini query result when llm is gemini', async () => {
    const result: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    jest.spyOn(service, 'gemini_query').mockResolvedValue({ query: result });

    const response = await controller.getSchemaMetadata(
      { llm: 'gemini', query: 'some query', databaseServerID: 'someID', language: 'mysql' },
      {}
    );

    expect(response).toBe(result);
    expect(service.gemini_query).toHaveBeenCalled();
  });

  it('should return Gemini query result when both queries succeed', async () => {
    const openAIResult: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    const geminiResult: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    jest
      .spyOn(service, 'open_ai_query')
      .mockResolvedValue({ query: openAIResult });
    jest
      .spyOn(service, 'gemini_query')
      .mockResolvedValue({ query: geminiResult });

    const response = await controller.getSchemaMetadata(
      { databaseServerID: 'someID', query: 'some query', language: 'mysql' },
      {}
    );

    expect(response).toBe(geminiResult);
    expect(service.open_ai_query).toHaveBeenCalled();
    expect(service.gemini_query).toHaveBeenCalled();
  });

  it('should return gemini query result when openAI query fails', async () => {
    const geminiResult: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    jest
      .spyOn(service, 'open_ai_query')
      .mockRejectedValue(new Error('openAI error'));
    jest
      .spyOn(service, 'gemini_query')
      .mockResolvedValue({ query: geminiResult });

    const response = await controller.getSchemaMetadata(
      { databaseServerID: 'someID', query: 'some query', language: 'mysql' },
      {}
    );

    expect(response).toBe(geminiResult);
    expect(service.open_ai_query).toHaveBeenCalled();
    expect(service.gemini_query).toHaveBeenCalled();
  });

  it('should return openAI query result when gemini query fails', async () => {
    const openAIResult: Query = {
      databaseServerID: 'someID',
      queryParams: {} as any
    };
    jest
      .spyOn(service, 'gemini_query')
      .mockRejectedValue(new Error('openAI error'));
    jest
      .spyOn(service, 'open_ai_query')
      .mockResolvedValue({ query: openAIResult });

    const response = await controller.getSchemaMetadata(
      { databaseServerID: 'someID', query: 'some query', language: 'mysql' },
      {}
    );

    expect(response).toBe(openAIResult);
    expect(service.open_ai_query).toHaveBeenCalled();
    expect(service.gemini_query).toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when both queries fail', async () => {
    jest
      .spyOn(service, 'open_ai_query')
      .mockRejectedValue(new Error('openAI error'));
    jest
      .spyOn(service, 'gemini_query')
      .mockRejectedValue(new Error('gemini error'));

    await expect(
      controller.getSchemaMetadata(
        { databaseServerID: 'someID', query: 'some query', language: 'mysql' },
        {}
      )
    ).rejects.toThrow(InternalServerErrorException);

    expect(service.open_ai_query).toHaveBeenCalled();
    expect(service.gemini_query).toHaveBeenCalled();
  });

  it('should validate query DTO', async () => {
    const body = { some: 'data' };
    const result = { message: 'Validation passed' };
    jest.spyOn(service, 'validate_Query_DTO').mockResolvedValue(result);

    const response = await controller.validateQueryDTO(body);

    expect(response).toBe(result);
    expect(service.validate_Query_DTO).toHaveBeenCalledWith(body);
  });

  it('should validate query params DTO', async () => {
    const body = { some: 'data' };
    const result = { message: 'Validation passed' };
    jest.spyOn(service, 'validate_QueryParams_DTO').mockResolvedValue(result);

    const response = await controller.validateQueryParamsDTO(body);

    expect(response).toBe(result);
    expect(service.validate_QueryParams_DTO).toHaveBeenCalledWith(body);
  });
});
