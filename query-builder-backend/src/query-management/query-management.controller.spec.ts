import { Test, TestingModule } from '@nestjs/testing';
import { QueryManagementController } from './query-management.controller';
import { QueryManagementService } from './query-management.service';
import { Supabase } from '../supabase';
import { ConfigService } from '@nestjs/config';

describe('QueryManagementController', () => {
  let controller: QueryManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryManagementController],
      providers: [QueryManagementService, Supabase, ConfigService]
    }).compile();

    controller = module.get<QueryManagementController>(QueryManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
