import { Module } from '@nestjs/common';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import { QueryHandlerModule } from 'src/query-handler/query-handler.module';
import OpenAIApi from 'openai';
import { DbMetadataHandlerModule } from 'src/db-metadata-handler/db-metadata-handler.module';
import { DbMetadataHandlerService } from 'src/db-metadata-handler/db-metadata-handler.service';

@Module({
  imports: [QueryHandlerModule, OpenAIApi, DbMetadataHandlerModule],
  controllers: [NaturalLanguageController],
  providers: [NaturalLanguageService]
})
export class NaturalLanguageModule {}
