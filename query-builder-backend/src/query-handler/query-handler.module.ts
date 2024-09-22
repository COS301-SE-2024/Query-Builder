import { Module, Scope } from '@nestjs/common';
import { QueryHandlerController } from './query-handler.controller';
import { JsonConverterModule } from '../json-converter/json-converter.module';
import { ConnectionManagerModule } from '../connection-manager/connection-manager.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { QueryHandlerFactory } from './query-handler.factory';
import { MySqlQueryHandlerService } from './my-sql-query-handler/my-sql-query-handler.service';
import { PostgresQueryHandlerService } from './postgres-query-handler/postgres-query-handler.service';

@Module({
  imports: [
    JsonConverterModule,
    ConnectionManagerModule,
    MyLoggerModule
  ],
  controllers: [QueryHandlerController],
  providers: [
    {
      provide: 'QueryHandlerService',
      scope: Scope.REQUEST,
      useFactory: (queryHandlerFactory: QueryHandlerFactory) => {
        return queryHandlerFactory.createQueryHandlerService();
      },
      inject: [QueryHandlerFactory]
    },
    QueryHandlerFactory,
    MySqlQueryHandlerService,
    PostgresQueryHandlerService
  ],
  exports: ['QueryHandlerService']
})
export class QueryHandlerModule {}
