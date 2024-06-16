import { Module } from '@nestjs/common';
import { OrgManagementController } from './org-management.controller';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';

@Module({
  controllers: [OrgManagementController],
  providers: [OrgManagementService, Supabase]
})
export class OrgManagementModule {}
