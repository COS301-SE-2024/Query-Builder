import { Module } from '@nestjs/common';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';

@Module({
  controllers: [DbMetadataHandlerController],
  providers: [DbMetadataHandlerService]
})
export class DbMetadataHandlerModule {}
