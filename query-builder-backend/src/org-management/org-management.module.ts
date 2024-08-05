import { Module } from '@nestjs/common';
import { OrgManagementController } from './org-management.controller';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';
import { AppService } from 'src/app.service';

@Module({
  controllers: [OrgManagementController],
  providers: [OrgManagementService, Supabase, AppService]
})
export class OrgManagementModule {}
