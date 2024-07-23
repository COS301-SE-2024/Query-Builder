import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotFoundException, HttpException } from '@nestjs/common';
import { AppService } from '../app.service';
import { createClient } from '@supabase/supabase-js';
import { rejects } from 'assert';
import { error, log } from 'console';
import { resolve } from 'dns';
import { get } from 'http';
import { mock } from 'node:test';
import { from } from 'rxjs';
import exp from 'constants';
import e from 'express';

// jest.mock('@supabase/supabase-js', () => {
//   let testData = [];

//   return {
//     createClient: jest.fn().mockImplementation(() => {
//       return {
//         from: jest.fn().mockReturnThis(),
//         select: jest.fn().mockImplementation(() => ({
//           eq: jest.fn().mockReturnThis(),
//           in: jest.fn().mockReturnThis(),
//           is: jest.fn().mockReturnThis(),
//           order: jest.fn().mockReturnThis(),
//           gte: jest.fn().mockReturnThis(),
//           lte: jest.fn().mockReturnThis(),
//           data: testData, // Use the data variable here
//           error: null
//         })),
//         update: jest.fn().mockImplementation(() => ({
//           eq: jest.fn().mockReturnThis(),
//           in: jest.fn().mockReturnThis(),
//           is: jest.fn().mockReturnThis(),
//           order: jest.fn().mockReturnThis(),
//           gte: jest.fn().mockReturnThis(),
//           lte: jest.fn().mockReturnThis(),
//           select: jest.fn().mockReturnThis(),
//           data: testData, // Use the data variable here
//           error: null
//         })),
//         auth: {
//           admin: {
//             createUser: jest.fn().mockReturnThis(),
//             deleteUser: jest.fn().mockReturnThis(),
//             data: testData
//           }
//         }
//       };
//     }),
//     setTestData: (newData) => {
//       testData = newData;
//     }
//   };
// });

jest.mock('../supabase/supabase.ts', () => {
  let testData: any[] = [];
  let testError: any = null;

  return {
    Supabase: jest.fn().mockImplementation(() => {
      return {
        getJWT: jest.fn(),
        getClient: jest.fn().mockImplementation(() => {
          return {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockImplementation(() => ({
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              match: jest.fn().mockReturnThis(),
              data: testData, // Use the data variable here
              error: testError
            })),
            update: jest.fn().mockImplementation(() => ({
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              match: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              data: testData, // Use the data variable here
              error: testError
            })),
            auth: {
              admin: {
                createUser: jest.fn().mockReturnThis(),
                deleteUser: jest.fn().mockReturnThis(),
                data: testData,
                error: testError
              }
            }
          };
        })
      };
    }),
    setTestData: (newData: any[]) => {
      testData = newData;
    },
    setTestError: (newError: any) => {
      testError = newError;
    }
  };
});

describe('OrgManagementService', () => {
  let service: OrgManagementService;
  let supabase: Supabase;
  let configService: ConfigService;

  let testUser = {
    user_id: 'eef0f46d-8a43-4b8c-81eb-dd8a31a3ad38',
    email: 'test@example.com',
    password: 'password',
    first_name: 'John',
    last_name: 'Doe'
  };

  let testOrg = {
    org_id: '6e37881c-f541-4048-b4c4-b1d59fa888e4',
    created_at: '2024-07-23T11:21:22.477654+00:00',
    name: 'Beeby',
    logo: null,
    org_members: [
      {
        org_id: '6e37881c-f541-4048-b4c4-b1d59fa888e4',
        user_id: '28ea7d35-9ade-4f01-9cdd-232622dd68ba',
        user_role: 'owner',
        created_at: '2024-07-23T11:21:23.056708+00:00',
        role_permissions: {
          add_dbs: true,
          is_owner: true,
          remove_dbs: true,
          update_dbs: true,
          invite_users: true,
          remove_users: true,
          view_all_dbs: true,
          view_all_users: true,
          update_db_access: true,
          update_user_roles: true
        }
      }
    ]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [OrgManagementService, Supabase, ConfigService, AppService]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
    supabase = await module.resolve<Supabase>(Supabase);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [OrgManagementService, Supabase, ConfigService, AppService]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
    supabase = await module.resolve<Supabase>(Supabase);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('getOrg', () => {
    beforeEach(() => {
      const { setTestData } = require('../supabase/supabase.ts');
      setTestData([]);
    });

    it('should return an organisation', async () => {
      const { setTestData } = require('../supabase/supabase.ts');
      setTestData([{ ...testOrg }]);

      const { data } = await service.getOrg({ org_id: testOrg.org_id });
      expect(data).toBeDefined();
      expect(data[0]).toEqual(testOrg);
    });

    it('should throw a NotFoundException if the organisation does not exist', async () => {
      const { setTestData } = require('../supabase/supabase.ts');
      setTestData([]);

      expect(service.getOrg({ org_id: testOrg.org_id })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should rethrow the error generated by the Supabase client', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError({ message: 'An error occurred', status: 500 });

      service.getOrg({ org_id: testOrg.org_id }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'An error occurred');
        expect(error).toHaveProperty('status', 500);
      });
    });
  });

  // describe('getOrgLoggedIn', () => {
  //   beforeEach(async () => {
  //     const supabaseUrl = configService.get<string>('SUPABASE_URL');
  //     const supabaseKey = configService.get<string>('SUPABASE_KEY');

  //     SupabaseMock.getClient.mockReturnValue(
  //       createClient(supabaseUrl, supabaseKey, {
  //         auth: {
  //           autoRefreshToken: false,
  //           persistSession: false,
  //           detectSessionInUrl: false
  //         }
  //       })
  //     );

  //     const { data } = await SupabaseMock.getClient().auth.signInWithPassword({
  //       email: testUser.email,
  //       password: testUser.password
  //     });

  //     const jwt = data.session.access_token;

  //     SupabaseMock.getJwt.mockReturnValue(jwt);
  //     SupabaseMock.getClient.mockReturnValue(
  //       createClient(supabaseUrl, supabaseKey, {
  //         auth: {
  //           autoRefreshToken: false,
  //           persistSession: false,
  //           detectSessionInUrl: false
  //         },
  //         global: {
  //           headers: {
  //             Authorization: `Bearer ${jwt}`
  //           }
  //         }
  //       })
  //     );
  //   });

  //   it('should return an organization', async () => {
  //     const org = await service.getOrgLoggedIn();
  //     expect(org).toBeDefined();
  //     // expect(org.data[0].org_id).toEqual(testOrg.org_id);
  //     // expect(org.data[0].name).toEqual(testOrg.name);
  //   });
  //   it('should throw a NotFoundException if the organization does not exist', async () => {
  //     expect(service.getOrgLoggedIn()).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('getMembers', () => {
  //   beforeEach(async () => {
  //     const supabaseUrl = configService.get<string>('SUPABASE_URL');
  //     const supabaseKey = configService.get<string>('SUPABASE_KEY');

  //     SupabaseMock.getClient.mockReturnValue(
  //       createClient(supabaseUrl, supabaseKey, {
  //         auth: {
  //           autoRefreshToken: false,
  //           persistSession: false,
  //           detectSessionInUrl: false
  //         }
  //       })
  //     );

  //     const { data } = await SupabaseMock.getClient().auth.signInWithPassword({
  //       email: testUser.email,
  //       password: testUser.password
  //     });

  //     const jwt = data.session.access_token;

  //     SupabaseMock.getJwt.mockReturnValue(jwt);
  //     SupabaseMock.getClient.mockReturnValue(
  //       createClient(supabaseUrl, supabaseKey, {
  //         auth: {
  //           autoRefreshToken: false,
  //           persistSession: false,
  //           detectSessionInUrl: false
  //         },
  //         global: {
  //           headers: {
  //             Authorization: `Bearer ${jwt}`
  //           }
  //         }
  //       })
  //     );
  //   });

  //   it('should return an array of members', async () => {
  //     const members = await service.getMembers({ org_id: testOrg.org_id });
  //     expect(members).toBeDefined();
  //   });

  //   it('should throw a Unauthorised exception if the organisation cannot resolve the owner', async () => {
  //     expect(
  //       service.getMembers({ org_id: '781f9a26-4a5d-4091-87c3-6c6ad06aa939' })
  //     ).rejects.toThrow(HttpException);
  //   });
  // });

  // describe('getDbs', () => {});
  // describe('createOrg', () => {});
  // describe('addMember', () => {});
  // describe('addDb', () => {});
  // describe('updateOrg', () => {});
  // describe('updateMember', () => {});
  // describe('updateDb', () => {});
  // describe('removeOrg', () => {});
  // describe('removeMember', () => {});
  // describe('removeDb', () => {});
});
