import { Test, TestingModule } from '@nestjs/testing';
import { MySqlDbMetadataHandlerService } from './my-sql-db-metadata-handler.service';
import { Query } from './../../interfaces/dto/query.dto';

describe('MySqlDbMetadataHandlerService', () => {
  let service: MySqlDbMetadataHandlerService;

  it('should be defined', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{database: 'sakila'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(service).toBeDefined();
  });

  it('should return the QueryHandlerService\'s results for databases metadata', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{database: 'sakila'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(await service.getDatabaseMetadata({databaseServerID: '1234', language: 'mysql'}, {})).toEqual({data: [{database: 'sakila'}]});

  });

  it('should return the QueryHandlerService\'s results.data for tables metadata', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{table_name: 'film'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(await service.getTableMetadata({databaseServerID: '1234', language: 'mysql', database: 'sakila'}, {})).toEqual([{table_name: 'film'}]);

  });

  it('should return the QueryHandlerService\'s results for fields metadata', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{column_name: 'first_name'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(await service.getFieldMetadata({databaseServerID: '1234', language: 'mysql', database: 'sakila', table: 'actor'}, {})).toEqual({data: [{column_name: 'first_name'}]});

  });

  it('should return the QueryHandlerService\'s results.data for foreign key metadata, for keys pointing away and to the table', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{column_name: 'first_name'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(await service.getForeignKeyMetadata({databaseServerID: '1234', language: 'mysql', database: 'sakila', table: 'actor'}, {})).toEqual([{column_name: 'first_name'}, {column_name: 'first_name'}]);

  });

  it('should return the QueryHandlerService\'s results for server summary metadata', async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {
            queryDatabase(query: Query, session: Record<string, any>){return {data: [{database_name: 'sakila', table_name: 'actor', column_name: 'first_name'}]}}
          }
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);

    expect(await service.getServerSummary({databaseServerID: '1234', language: 'mysql'}, {})).toEqual({data: [{database_name: 'sakila', table_name: 'actor', column_name: 'first_name'}]});

  });

});
