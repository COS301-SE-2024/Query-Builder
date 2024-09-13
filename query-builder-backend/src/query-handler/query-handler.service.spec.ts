import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterModule } from '../json-converter/json-converter.module';
import { ConnectionManagerModule } from '../connection-manager/connection-manager.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { AppService } from '../app.service';

describe('QueryHandlerService', () => {
  let service: QueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JsonConverterModule.forRoot('mysql'),
        ConnectionManagerModule.forRoot('mysql'),
        MyLoggerModule
      ],
      providers: [QueryHandlerService, AppService]
    }).compile();

    service = module.get<QueryHandlerService>(QueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
