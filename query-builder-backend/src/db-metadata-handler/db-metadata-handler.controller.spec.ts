import { Test, TestingModule } from '@nestjs/testing';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';
import { AppService } from '../app.service';

jest.mock('./db-metadata-handler.service.ts', () => ({
  DbMetadataHandlerService: jest.fn().mockImplementation(() => ({
    getSchemaMetadata: jest.fn(),
    getTableMetadata: jest.fn(),
    getFieldMetadata: jest.fn(),
    getForeignKeyMetadata: jest.fn(),
    getSchemaSummary: jest.fn()
  }))
}));

describe('DbMetadataHandlerController', () => {
  let controller: DbMetadataHandlerController;
  let dbMetadataHandlerService: DbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [QueryHandlerModule],
      controllers: [DbMetadataHandlerController],
      providers: [DbMetadataHandlerService, AppService]
    }).compile();

    controller = module.get<DbMetadataHandlerController>(
      DbMetadataHandlerController
    );
    dbMetadataHandlerService = module.get<DbMetadataHandlerService>(
      DbMetadataHandlerService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getSchemaMetadata', () => {
    it('should call getSchemaMetadata on the service with correct parameters', async () => {
      const schemaQuery = { databaseServerID: 'test-server-id' };
      const session = { user: 'test-user' };

      jest.spyOn(dbMetadataHandlerService, 'getSchemaMetadata').mockResolvedValue({})

      await controller.getSchemaMetadata(schemaQuery, session);
      expect(dbMetadataHandlerService.getSchemaMetadata).toHaveBeenCalledWith(
        schemaQuery,
        session
      );
    });
  });

  describe('getTableMetadata', () => {
    it('should call getTableMetadata on the service with correct parameters', async () => {
      const tableQuery = {
        databaseServerID: 'test-server-id',
        schema: 'test-schema'
      };
      const session = { user: 'test-user' };

      jest.spyOn(dbMetadataHandlerService, 'getTableMetadata').mockResolvedValue({})

      await controller.getTableMetadata(tableQuery, session);
      expect(dbMetadataHandlerService.getTableMetadata).toHaveBeenCalledWith(
        tableQuery,
        session
      );
    });
  });

  describe('getFieldMetadata', () => {
    it('should call getFieldMetadata on the service with correct parameters', async () => {
      const fieldQuery = {
        databaseServerID: 'test-server-id',
        schema: 'test-schema',
        table: 'test-table'
      };
      const session = { user: 'test-user' };

      jest.spyOn(dbMetadataHandlerService, 'getFieldMetadata').mockResolvedValue({})

      await controller.getFieldMetadata(fieldQuery, session);
      expect(dbMetadataHandlerService.getFieldMetadata).toHaveBeenCalledWith(
        fieldQuery,
        session
      );
    });
  });

  describe('getForeignKeyMetadata', () => {
    it('should call getForeignKeyMetadata on the service with correct parameters', async () => {
      const foreignKeyQuery = {
        databaseServerID: 'test-server-id',
        schema: 'test-schema',
        table: 'test-table'
      };
      const session = { user: 'test-user' };

      jest.spyOn(dbMetadataHandlerService, 'getForeignKeyMetadata').mockResolvedValue({})

      await controller.getForeignKeyMetadata(foreignKeyQuery, session);
      expect(
        dbMetadataHandlerService.getForeignKeyMetadata
      ).toHaveBeenCalledWith(foreignKeyQuery, session);
    });
  });

  describe('getSchemaSummary', () => {
    it('should call getSchemaSummary on the service with correct parameters', async () => {
      const schemaQuery = { databaseServerID: 'test-server-id' };
      const session = { user: 'test-user' };

      jest.spyOn(dbMetadataHandlerService, 'getSchemaSummary').mockResolvedValue({})

      await controller.getSchemaSummary(schemaQuery, session);
      expect(dbMetadataHandlerService.getSchemaSummary).toHaveBeenCalledWith(
        schemaQuery,
        session
      );
    });
  });
});
