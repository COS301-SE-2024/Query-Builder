import { Module } from '@nestjs/common';
import { QueryManagementController } from './query-management.controller';
import { QueryManagementService } from './query-management.service';
import { Supabase } from 'src/supabase';

@Module({
  controllers: [QueryManagementController],
  providers: [QueryManagementService, Supabase]
})
export class QueryManagementModule {}
