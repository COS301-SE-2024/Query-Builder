import { Inject, Injectable } from '@nestjs/common';
import { Query } from '../interfaces/dto/query.dto';
import { JsonConverterService } from '../json-converter/json-converter.service';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';
import { SessionStore } from '../session-store/session-store.service';
import { MyLoggerService } from '../my-logger/my-logger.service';

@Injectable()
export abstract class QueryHandlerService {

  constructor(
    @Inject('JsonConverterService') protected readonly jsonConverterService: JsonConverterService,
    @Inject('ConnectionManagerService') protected readonly connectionManagerService: ConnectionManagerService,
    protected readonly sessionStore: SessionStore,
    protected logger: MyLoggerService
  ) {
    this.logger.setContext(QueryHandlerService.name);
  }

  abstract queryDatabase(
    query: Query,
    session: Record<string, any>
  ): Promise<any>;

}