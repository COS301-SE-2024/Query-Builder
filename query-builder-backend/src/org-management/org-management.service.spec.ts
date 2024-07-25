import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotFoundException, HttpException, UnauthorizedException } from '@nestjs/common';
import { AppService } from '../app.service';
import { createClient } from '@supabase/supabase-js';
import { match, rejects } from 'assert';
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

const SELECT = 0;
const UPDATE = 1;
const AUTH_ADMIN = 2;
const AUTH = 3;

jest.mock('../supabase/supabase.ts', () => {
  let testData: any[] = [];
  let testError: any = null;

  return {
    Supabase: jest.fn().mockImplementation(() => {
      return {
        getJwt: jest.fn(),
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
              data: testData[SELECT], // Use the data variable here
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
              data: testData[UPDATE], // Use the data variable here
              error: testError
            })),
            auth: {
              admin: {
                createUser: jest.fn().mockReturnThis(),
                deleteUser: jest.fn().mockReturnThis(),
                data: testData[AUTH_ADMIN],
                error: testError
              },
              getUser: jest.fn().mockReturnThis(),
              data: testData[AUTH],
              error: testError
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
    },
    getTestData: () => {
      return testData;
    },
    getTestError: () => {
      return testError;
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
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError(null);
    });

    it('should return an organisation', async () => {
      const { setTestData } = require('../supabase/supabase.ts');
      setTestData([[{ ...testOrg }]]);

      const { data } = await service.getOrg({ org_id: testOrg.org_id });
      expect(data).toBeDefined();
      expect(data[0]).toEqual(testOrg);
    });

    it('should throw a NotFoundException if the organisation does not exist', async () => {
      const { setTestData } = require('../supabase/supabase.ts');
      setTestData([[]]);

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

  describe('getOrgLoggedIn', () => {
    beforeEach(async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError(null);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError({ message: 'Not logged in', status: 401 });

      service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client if there is an error when querying the database', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError({ message: 'An error occurred', status: 500 });

      service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'An error occurred');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException if the organisation was not found', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');

      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Organisation not found');
      });
    });

    it('should return the organisations the user is a part of', async () => {
      const { setTestData } = require('../supabase/supabase.ts');

      let testData = [];
      testData[SELECT] = [{ ...testOrg, db_envs: [] }];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      const { data } = await service.getOrgLoggedIn();
      expect(data).toBeDefined();
      expect(data[0]).toEqual({ ...testOrg, db_envs: [] });
    });
  });

  describe('getMembers', () => {
    beforeEach(async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError(null);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError({ message: 'Not logged in', status: 401 });

      service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when it throws an error', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');
      setTestData([]);
      setTestError({ message: 'Internal Server Error', status: 500 });

      service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an Unauthorized Exception when the user is not a part of the organisation', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');

      let testData = [];

      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError();

      service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('You are not a member of this organisation');
      });
    });

    it('should throw UnauthorizedException when the user does not have permissions to see all the org members', async () => {
      const { setTestData, setTestError } = require('../supabase/supabase.ts');

      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner',
          role_permissions: {
            add_dbs: true,
            is_owner: true,
            remove_dbs: true,
            update_dbs: true,
            invite_users: true,
            remove_users: true,
            view_all_dbs: true,
            view_all_users: false,
            update_db_access: true,
            update_user_roles: true
          },
          profiles: {
            email: 'test@gmail.com',
            phone: null,
            user_id: '0000',
            username: 'Guestc5378d65',
            last_name: 'Doe',
            created_at: '2024-07-23T11:19:43.114044+00:00',
            first_name: 'John',
            profile_photo:'lmao.jpg',
            user_meta_data: null
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      }

      setTestData(testData);
      setTestError(null);

      service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('You do not have permission to view all members');
      })
    });

    it('should return the members of the organisation', async () => {
      const { setTestData } = require('../supabase/supabase.ts');
      
      let testData = []
      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner',
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
          },
          profiles: {
            email: 'test@gmail.com',
            phone: null,
            user_id: '0000',
            username: 'Guestc5378d65',
            last_name: 'Doe',
            created_at: '2024-07-23T11:19:43.114044+00:00',
            first_name: 'John',
            profile_photo: 'lmao.jpg',
            user_meta_data: null
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      }

      setTestData(testData);
      
      const { data } = await service.getMembers({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[SELECT]);
    })
  });

  describe('getDbs', () => {});
  describe('createOrg', () => {});
  describe('addMember', () => {});
  describe('addDb', () => {});
  describe('updateOrg', () => {});
  describe('updateMember', () => {});
  describe('updateDb', () => {});
  describe('removeOrg', () => {});
  describe('removeMember', () => {});
  describe('removeDb', () => {});
});
