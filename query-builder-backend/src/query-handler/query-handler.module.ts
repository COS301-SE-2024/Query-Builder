import { Module } from '@nestjs/common';
import { QueryHandlerController } from './query-handler.controller';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterModule } from '../jsonConverter/jsonConverter.module';
import { ConnectionManagerModule } from '../connection-manager/connection-manager.module';

@Module({
  imports: [JsonConverterModule, ConnectionManagerModule],
  controllers: [QueryHandlerController],
  providers: [QueryHandlerService],
  exports: [QueryHandlerService],
})
export class QueryHandlerModule {}
