import { Module } from '@nestjs/common';
import { QueryHandlerController } from './query-handler.controller';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

@Module({
  controllers: [QueryHandlerController],
  providers: [QueryHandlerService, JsonConverterService]
})
export class QueryHandlerModule {}
