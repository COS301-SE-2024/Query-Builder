import { Test, TestingModule } from '@nestjs/testing';
import { PostgresQueryHandlerService } from './postgres-query-handler.service';
import { QueryParams } from './../../interfaces/dto/query.dto';
import { Connect_Dto } from './../../connection-manager/dto/connect.dto';
import { SessionStore } from './../../session-store/session-store.service';
import { MyLoggerService } from './../../my-logger/my-logger.service';

describe('PostgresQueryHandlerService', () => {
  let service: PostgresQueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresQueryHandlerService,
        {
          provide: 'JsonConverterService',
          useValue: {
            convertJsonToQuery(query: QueryParams){return "mocked result"},
            convertJsonToCountQuery(query: QueryParams){return "mocked result"}
          }
        },
        {
          provide: 'ConnectionManagerService',
          useValue: {
            connectToDatabase(connectDto: Connect_Dto){return {success: true, connectionID: 1234}}
          }
        },
        SessionStore,
        MyLoggerService
      ],
    }).compile();

    service = module.get<PostgresQueryHandlerService>(PostgresQueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
