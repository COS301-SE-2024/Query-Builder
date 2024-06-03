import { Module } from '@nestjs/common';
import { JsonConverterController } from './jsonConverter.controller';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service'; 

@Module({
  controllers: [JsonConverterController],
  providers: [JsonConverterService]
})
export class JsonConverterModule {}
