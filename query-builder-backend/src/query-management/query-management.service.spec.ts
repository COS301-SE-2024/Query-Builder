import { Test, TestingModule } from '@nestjs/testing';
import { QueryManagementService } from './query-management.service';
import { Supabase } from '../supabase';
import { ConfigService } from '@nestjs/config';

describe('QueryManagementService', () => {
  let service: QueryManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryManagementService, Supabase, ConfigService],
    }).compile();

    service = module.get<QueryManagementService>(QueryManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
