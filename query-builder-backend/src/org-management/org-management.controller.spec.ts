import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementController } from './org-management.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { OrgManagementService } from './org-management.service';
import { AppService } from '../app.service';
import { ConfigModule } from '@nestjs/config';

describe('OrgManagementController', () => {
  let controller: OrgManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
      controllers: [OrgManagementController],
      providers: [OrgManagementService, AppService]
    }).compile();

    controller = module.get<OrgManagementController>(OrgManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
