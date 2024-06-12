import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { Supabase } from '../supabase';

@Module({
  controllers: [UserManagementController],
  providers: [UserManagementService, Supabase]
})
export class UserManagementModule {}
