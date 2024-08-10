import { Module } from '@nestjs/common';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import OpenAIApi from 'openai';
import { DbMetadataHandlerModule } from 'src/db-metadata-handler/db-metadata-handler.module';

@Module({
  imports: [OpenAIApi, DbMetadataHandlerModule],
  controllers: [NaturalLanguageController],
  providers: [NaturalLanguageService]
})
export class NaturalLanguageModule {}
