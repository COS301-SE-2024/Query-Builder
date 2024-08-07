import { Module } from '@nestjs/common';
import { DbMetadataHandlerController } from './db-metadata-handler.controller';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { QueryHandlerModule } from '../query-handler/query-handler.module';

@Module({
  imports: [QueryHandlerModule],
  controllers: [DbMetadataHandlerController],
  providers: [DbMetadataHandlerService],
  exports: [DbMetadataHandlerService]
})
export class DbMetadataHandlerModule {}
