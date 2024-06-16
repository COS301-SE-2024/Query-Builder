import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';

describe('OrgManagementService', () => {
  let service: OrgManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgManagementService],
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
