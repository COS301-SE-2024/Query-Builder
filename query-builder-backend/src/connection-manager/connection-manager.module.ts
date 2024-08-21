import { Module } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';
import { ConnectionManagerController } from './connection-manager.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '../app.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { MyLoggerModule } from '../my-logger/my-logger.module';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SessionStoreModule,
    MyLoggerModule
  ],
  controllers: [ConnectionManagerController],
  providers: [ConnectionManagerService, AppService],
  exports: [ConnectionManagerService]
})
export class ConnectionManagerModule {}
