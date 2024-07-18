import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConnectionManagerModule } from "./connection-manager/connection-manager.module";
import { JsonConverterModule } from "./jsonConverter/jsonConverter.module";
import { SupabaseGuard, SupabaseModule } from "./supabase";
import { APP_GUARD } from "@nestjs/core";
import { UserManagementModule } from "./user-management/user-management.module";
import { OrgManagementModule } from "./org-management/org-management.module";
import { QueryHandlerModule } from './query-handler/query-handler.module';
import { DbMetadataHandlerModule } from './db-metadata-handler/db-metadata-handler.module';
import { QueryManagementModule } from './query-management/query-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    ConnectionManagerModule,
    JsonConverterModule,
    SupabaseModule,
    UserManagementModule,
    OrgManagementModule,
    QueryHandlerModule,
    DbMetadataHandlerModule,
    QueryManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService]})
export class AppModule {}

/*
{
    provide: APP_GUARD,
    useClass: SupabaseGuard,
  }
*/
