import { Module, Scope } from '@nestjs/common';
import { JsonConverterController } from './json-converter.controller';
import { MongoJsonConverterService } from './mongo-json-converter/mongo-json-converter.service';
import { MysqlJsonConverterService } from './mysql-json-converter/mysql-json-converter.service';
import { PostgresJsonConverterService } from './postgres-json-converter/postgres-json-converter.service';
import { JsonConverterFactory } from './json-converter.factory';

@Module({
  controllers: [JsonConverterController],
  providers: [
    {
      provide: 'JsonConverterService',
      scope: Scope.REQUEST,
      useFactory: (jsonConverterFactory: JsonConverterFactory) => {
        return jsonConverterFactory.createJsonConverterService();
      },
      inject: [JsonConverterFactory]
    },
    JsonConverterFactory,
    MongoJsonConverterService,
    MysqlJsonConverterService,
    PostgresJsonConverterService
  ],
  exports: ['JsonConverterService']
})
export class JsonConverterModule {}
