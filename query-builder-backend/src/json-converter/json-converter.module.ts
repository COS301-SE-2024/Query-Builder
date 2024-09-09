import { JsonConverterService } from './json-converter.service';
import { BadRequestException, DynamicModule, Module } from '@nestjs/common';
import { JsonConverterController } from './json-converter.controller';
import { MongoJsonConverterService } from './mongo-json-converter/mongo-json-converter.service';
import { MysqlJsonConverterService } from './mysql-json-converter/mysql-json-converter.service';
import { PostgresJsonConverterService } from './postgres-json-converter/postgres-json-converter.service';

// @Module({
//   controllers: [JsonConverterController],
//   providers: [JsonConverterService, MongoJsonConverterService, MysqlJsonConverterService, PostgresJsonConverterService],
//   exports: [JsonConverterService, MongoJsonConverterService, MysqlJsonConverterService, PostgresJsonConverterService]
// })
// export class JsonConverterModule {}

@Module({})
export class JsonConverterModule {
  static forRoot(db_vendor: string): DynamicModule {
    let provider;
    switch (db_vendor) {
      case 'mongo':
        provider = {
          provide: JsonConverterService,
          useClass: MongoJsonConverterService
        };
        break;
      case 'mysql':
        provider = {
          provide: JsonConverterService,
          useClass: MysqlJsonConverterService
        };
        break;
      case 'postgres':
        provider = {
          provide: JsonConverterService,
          useClass: PostgresJsonConverterService
        };
        break;
      default:
        throw new BadRequestException('Invalid database vendor');
    }

    return {
      module: JsonConverterModule,
      controllers: [JsonConverterController],
      providers: [provider],
      exports: [provider]
    };
  }
}
