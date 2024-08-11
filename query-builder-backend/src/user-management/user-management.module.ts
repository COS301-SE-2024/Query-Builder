import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { SupabaseModule } from '../supabase';
import { SessionStoreModule } from 'src/session-store/session-store.module';

@Module({
  imports: [
    SupabaseModule,
    SessionStoreModule
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService]
})
export class UserManagementModule {}
