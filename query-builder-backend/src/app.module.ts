import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConnectModule } from "./connect/connect.module";
import { ConnectionManagerModule } from "./connection-manager/connection-manager.module";
import { JsonConverterModule } from "./jsonConverter/jsonConverter.module";
import { SupabaseGuard, SupabaseModule } from "./supabase";
import { APP_GUARD } from "@nestjs/core";
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    ConnectModule,
    ConnectionManagerModule,
    JsonConverterModule,
    SupabaseModule,
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: SupabaseGuard,
  }],
})
export class AppModule {}
