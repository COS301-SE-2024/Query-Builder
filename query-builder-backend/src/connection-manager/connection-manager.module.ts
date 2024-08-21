import { Module } from '@nestjs/common';
import { ConnectionManagerController } from './connection-manager.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '../app.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { PostgresConnectionManagerService } from './postgres-connection-manager/postgres-connection-manager.service';
import { MySqlConnectionManagerService } from './my-sql-connection-manager/my-sql-connection-manager.service';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SessionStoreModule,
    MyLoggerModule
  ],
  controllers: [ConnectionManagerController],
  providers: [AppService, PostgresConnectionManagerService, MySqlConnectionManagerService],
  exports: [PostgresConnectionManagerService, MySqlConnectionManagerService]
})
export class ConnectionManagerModule {}