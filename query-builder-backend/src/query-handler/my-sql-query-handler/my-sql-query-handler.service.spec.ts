import { Test, TestingModule } from '@nestjs/testing';
import { MySqlQueryHandlerService } from './my-sql-query-handler.service';
import { QueryParams } from './../../interfaces/dto/query.dto';
import { Connect_Dto } from './../../connection-manager/dto/connect.dto';
import { SessionStore } from './../../session-store/session-store.service';
import { MyLoggerService } from './../../my-logger/my-logger.service';

describe('MySqlQueryHandlerService', () => {
  let service: MySqlQueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlQueryHandlerService,
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

    service = module.get<MySqlQueryHandlerService>(MySqlQueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
