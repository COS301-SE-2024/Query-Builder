import { JsonConverterService } from './json-converter.service';
import { Module } from '@nestjs/common';
import { JsonConverterController } from './json-converter.controller';
import { MongoJsonConverterService } from './mongo-json-converter/mongo-json-converter.service';
import { MysqlJsonConverterService } from './mysql-json-converter/mysql-json-converter.service';
import { PostgresJsonConverterService } from './postgres-json-converter/postgres-json-converter.service';

@Module({
  controllers: [JsonConverterController],
  providers: [MongoJsonConverterService, MysqlJsonConverterService, PostgresJsonConverterService],
  exports: [JsonConverterService, MongoJsonConverterService, MysqlJsonConverterService, PostgresJsonConverterService]
})
export class JsonConverterModule {}
