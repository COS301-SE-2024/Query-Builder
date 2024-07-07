import { Module } from '@nestjs/common';
import { QueryHandlerController } from './query-handler.controller';
import { QueryHandlerService } from './query-handler.service';

@Module({
  controllers: [QueryHandlerController],
  providers: [QueryHandlerService]
})
export class QueryHandlerModule {}
