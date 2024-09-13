import { BadRequestException, DynamicModule, Module } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';
import { ConnectionManagerController } from './connection-manager.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '../app.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { MySqlConnectionManagerService } from './my-sql-connection-manager/my-sql-connection-manager.service';

// @Module({
//   imports: [
//     SupabaseModule,
//     ConfigModule.forRoot({ isGlobal: true }),
//     SessionStoreModule,
//     MyLoggerModule
//   ],
//   controllers: [ConnectionManagerController],
//   providers: [ConnectionManagerService, AppService],
//   exports: [ConnectionManagerService]
// })
// export class ConnectionManagerModule {}

@Module({})
export class ConnectionManagerModule {
  static forRoot(db_vendor: string): DynamicModule {
    let provider;
    switch (db_vendor) {
      case 'mysql':
        provider = {
          provide: ConnectionManagerService,
          useClass: MySqlConnectionManagerService
        };
        break;
      case 'postgres':
        provider = {
          provide: ConnectionManagerService,
          useClass: MySqlConnectionManagerService
        };
        break;
      default:
        throw new BadRequestException('Invalid database vendor');
    }

    return {
      module: ConnectionManagerModule,
      imports: [
        SupabaseModule,
        ConfigModule.forRoot({ isGlobal: true }),
        SessionStoreModule,
        MyLoggerModule
      ],
      controllers: [ConnectionManagerController],
      providers: [provider, AppService],
      exports: [provider]
    };
  }
}
