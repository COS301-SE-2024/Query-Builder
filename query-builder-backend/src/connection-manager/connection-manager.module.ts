import { Module, Scope } from '@nestjs/common';
import { ConnectionManagerController } from './connection-manager.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '../app.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { MySqlConnectionManagerService } from './my-sql-connection-manager/my-sql-connection-manager.service';
import { ConnectionManagerFactory } from './connection-manager.factory';
import { PostgresConnectionManagerService } from './postgres-connection-manager/postgres-connection-manager.service';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SessionStoreModule,
    MyLoggerModule
  ],
  controllers: [ConnectionManagerController],
  providers: [
    {
      provide: 'ConnectionManagerService',
      scope: Scope.REQUEST,
      useFactory: (connectionManagerFactory: ConnectionManagerFactory) => {
        return connectionManagerFactory.createConnectionManagerService();
      },
      inject: [ConnectionManagerFactory]
    },
    ConnectionManagerFactory,
    MySqlConnectionManagerService,
    PostgresConnectionManagerService,
    AppService
  ],
  exports: ['ConnectionManagerService']
})
export class ConnectionManagerModule {}
