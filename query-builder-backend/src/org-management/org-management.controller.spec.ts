import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementController } from './org-management.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { OrgManagementService } from './org-management.service';
import { AppService } from '../app.service';
import { ConfigModule } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('OrgManagementController', () => {
  let controller: OrgManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
      controllers: [OrgManagementController],
      providers: [OrgManagementService, AppService]
    })
      .useMocker((token) => {
        if (token === OrgManagementService) {
          return {
            getOrg: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            getOrgLoggedIn: jest
              .fn()
              .mockReturnValue({ data: { name: 'test' } }),
            getMembers: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            getDbs: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            uploadOrgLogo: jest
              .fn()
              .mockReturnValue({ data: { name: 'test' } }),
            createOrg: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            addMember: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            addDb: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            giveDbAccess: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            saveDbSecrets: jest
              .fn()
              .mockReturnValue({ data: { name: 'test' } }),
            updateOrg: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            updateMember: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            updateDb: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            removeOrg: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            removeMember: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            removeDb: jest.fn().mockReturnValue({ data: { name: 'test' } }),
            removeDbAccess: jest
              .fn()
              .mockReturnValue({ data: { name: 'test' } })
          };
        } else if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<OrgManagementController>(OrgManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should get org', async () => {
  //   expect(await controller.getOrg({})).toEqual({ name: 'test' });
  // });
});
