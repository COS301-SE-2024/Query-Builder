import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';
import { Supabase } from './supabase';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [Supabase, SupabaseStrategy, SupabaseGuard, ConfigService],
  exports: [Supabase, SupabaseStrategy, SupabaseGuard, ConfigService],
})
export class SupabaseModule {}
