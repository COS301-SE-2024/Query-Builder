import { Module } from '@nestjs/common';
import { JsonConverterController } from './jsonConverter.controller';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service'; 

@Module({
  controllers: [JsonConverterController],
  providers: [JsonConverterService],
  exports: [JsonConverterService],
})
export class JsonConverterModule {}
