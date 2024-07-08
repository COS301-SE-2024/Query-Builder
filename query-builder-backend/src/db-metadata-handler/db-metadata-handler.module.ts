import { Module } from '@nestjs/common';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerService } from 'src/query-handler/query-handler.service';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

@Module({
  controllers: [DbMetadataHandlerController],
  providers: [DbMetadataHandlerService, QueryHandlerService, JsonConverterService]
})
export class DbMetadataHandlerModule {}
