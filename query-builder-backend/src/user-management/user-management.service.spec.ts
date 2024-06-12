import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { Supabase } from '../supabase';
import { ConfigService } from '@nestjs/config';

describe('UserManagementService', () => {
  let service: UserManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserManagementService, Supabase, ConfigService], 
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
