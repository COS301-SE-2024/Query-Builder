import { Module } from '@nestjs/common';
import { OrgManagementController } from './org-management.controller';
import { OrgManagementService } from './org-management.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AppService } from 'src/app.service';
import { ConfigModule } from '@nestjs/config';
import { SessionStoreModule } from 'src/session-store/session-store.module';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SessionStoreModule
  ],
  controllers: [OrgManagementController],
  providers: [OrgManagementService, AppService],
  exports: [OrgManagementService]
})
export class OrgManagementModule {}
