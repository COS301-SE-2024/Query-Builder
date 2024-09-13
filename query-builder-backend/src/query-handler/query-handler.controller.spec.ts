import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerController } from './query-handler.controller';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterModule } from '../json-converter/json-converter.module';
import { SessionStoreModule } from '../session-store/session-store.module';
import { ConnectionManagerModule } from '../connection-manager/connection-manager.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { AppService } from '../app.service';

describe('QueryHandlerController', () => {
  let controller: QueryHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JsonConverterModule.forRoot('mysql'),
        ConnectionManagerModule.forRoot('mysql'),
        MyLoggerModule
      ],
      controllers: [QueryHandlerController],
      providers: [QueryHandlerService, AppService]
    }).compile();

    controller = module.get<QueryHandlerController>(QueryHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
