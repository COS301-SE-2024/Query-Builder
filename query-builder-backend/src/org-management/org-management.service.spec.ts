import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';
import { ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';

describe('OrgManagementService', () => {
  let service: OrgManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgManagementService, Supabase, ConfigService, AppService],
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
