import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerController } from './query-handler.controller';
import { Query, QueryParams } from './../interfaces/dto/query.dto';
import { Connect_Dto } from './../connection-manager/dto/connect.dto';
import { SessionStore } from './../session-store/session-store.service';
import { MyLoggerService } from './../my-logger/my-logger.service';

describe('QueryHandlerController', () => {
  let controller: QueryHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryHandlerController],
      providers: [
        {
          provide: 'QueryHandlerService',
          useValue: {
            async queryDatabase(query: Query, session: Record<string, any>){return {}}
          }
        },
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

    controller = module.get<QueryHandlerController>(QueryHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
