import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';
import { AppService } from '../app.service';
import { QueryHandlerService } from '../query-handler/query-handler.service';

jest.mock('../query-handler/query-handler.service', () => ({
  QueryHandlerService: jest.fn().mockImplementation(() => ({
    queryDatabase: jest.fn()
  }))
}));

describe('DbMetadataHandlerService', () => {
  let service: DbMetadataHandlerService;
  let queryHandlerService: QueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [QueryHandlerModule],
      providers: [DbMetadataHandlerService, AppService]
    }).compile();

    service = module.get<DbMetadataHandlerService>(DbMetadataHandlerService);
    queryHandlerService = module.get<QueryHandlerService>(QueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get schema metadata', async () => {
    const schemaQuery = { databaseServerID: 'test-server' };
    const session = {};
    const mockResponse = { data: [{ schema_name: 'test_schema' }] };

    jest
      .spyOn(queryHandlerService, 'queryDatabase')
      .mockResolvedValue(mockResponse);

    const result = await service.getSchemaMetadata(schemaQuery, session);
    expect(result).toEqual(mockResponse);
  });

  it('should get table metadata', async () => {
    const tableQuery = {
      databaseServerID: 'test-server',
      schema: 'test_schema'
    };
    const session = {};
    const mockResponse = { data: [{ table_name: 'test_table' }] };

    jest
      .spyOn(queryHandlerService, 'queryDatabase')
      .mockResolvedValue(mockResponse);

    const result = await service.getTableMetadata(tableQuery, session);
    expect(result).toEqual(mockResponse.data);
  });

  it('should get field metadata', async () => {
    const fieldQuery = {
      databaseServerID: 'test-server',
      schema: 'test_schema',
      table: 'test_table'
    };
    const session = {};
    const mockResponse = { data: [{ column_name: 'test_column' }] };

    jest
      .spyOn(queryHandlerService, 'queryDatabase')
      .mockResolvedValue(mockResponse);

    const result = await service.getFieldMetadata(fieldQuery, session);
    expect(result).toEqual(mockResponse);
  });

  it('should get foreign key metadata', async () => {
    const foreignKeyQuery = {
      databaseServerID: 'test-server',
      schema: 'test_schema',
      table: 'test_table'
    };
    const session = {};
    const mockFromResponse = {
      data: [{ column_name: 'test_column', referenced_table_name: 'ref_table' }]
    };
    const mockToResponse = {
      data: [
        {
          table_name: 'test_table',
          column_name: 'test_column',
          referenced_table_name: 'ref_table'
        }
      ]
    };

    const {
      QueryHandlerService
    } = require('../query-handler/query-handler.service');

    jest
      .spyOn(queryHandlerService, 'queryDatabase')
      .mockResolvedValueOnce(mockFromResponse)
      .mockResolvedValueOnce(mockToResponse);

    const result = await service.getForeignKeyMetadata(
      foreignKeyQuery,
      session
    );
    expect(result).toEqual(mockFromResponse.data.concat(mockToResponse.data));
  });

  it('should get schema summary', async () => {
    const schemaQuery = { databaseServerID: 'test-server' };
    const session = {};
    const mockResponse = {
      data: [
        {
          schema_name: 'test_schema',
          table_name: 'test_table',
          column_name: 'test_column'
        }
      ]
    };

    jest
      .spyOn(queryHandlerService, 'queryDatabase')
      .mockResolvedValue(mockResponse);

    const result = await service.getSchemaSummary(schemaQuery, session);
    expect(result).toEqual(mockResponse);
  });
});
