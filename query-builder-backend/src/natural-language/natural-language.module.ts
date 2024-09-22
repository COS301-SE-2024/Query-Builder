import { Module } from '@nestjs/common';
import { NaturalLanguageController } from './natural-language.controller';
import { NaturalLanguageService } from './natural-language.service';
import OpenAIApi from 'openai';
import { DbMetadataHandlerModule } from '../db-metadata-handler/db-metadata-handler.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';

@Module({
  imports: [OpenAIApi, DbMetadataHandlerModule, MyLoggerModule],
  controllers: [NaturalLanguageController],
  providers: [NaturalLanguageService]
})
export class NaturalLanguageModule {}
