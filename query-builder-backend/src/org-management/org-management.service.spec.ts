import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import {
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';
import { AppService } from '../app.service';

const SELECT = 0;
const UPDATE = 1;
const AUTH_ADMIN = 2;
const AUTH = 3;
const INSERT = 4;
const DELETE = 5;
const STORAGE = 6;

jest.mock('../supabase/supabase.ts', () => {
  let testData: any[] = [];
  let testError: any[] = [];

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
              error: testError[SELECT]
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
              error: testError[UPDATE]
            })),
            insert: jest.fn().mockImplementation(() => ({
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              match: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              data: testData[INSERT],
              error: testError[INSERT]
            })),
            upsert: jest.fn().mockImplementation(() => ({
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              match: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              data: testData[INSERT],
              error: testError[INSERT]
            })),
            delete: jest.fn().mockImplementation(() => ({
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              match: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              data: testData[DELETE],
              error: testError[DELETE]
            })),
            storage: {
              from: jest.fn().mockReturnThis(),
              upload: jest.fn().mockReturnThis(),
              getPublicUrl: jest.fn().mockReturnThis(),
              data: testData[STORAGE],
              error: testError[STORAGE]
            },
            auth: {
              admin: {
                createUser: jest.fn().mockReturnThis(),
                deleteUser: jest.fn().mockReturnThis(),
                data: testData[AUTH_ADMIN],
                error: testError[AUTH_ADMIN]
              },
              getUser: jest.fn().mockReturnThis(),
              data: testData[AUTH],
              error: testError[AUTH]
            }
          };
        })
      };
    }),
    setTestData: (newData: any[]) => {
      testData = newData;
    },
    setTestError: (newError: any[]) => {
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

jest.mock('express-session', () => {
  return {
    session: jest.fn((req, res, next) => {
      req.session = {};
      next();
    })
  };
});

describe('OrgManagementService', () => {
  const { setTestData, setTestError } = require('../supabase/supabase.ts');
  let service: OrgManagementService;
  let module: TestingModule;

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
    module = await Test.createTestingModule({
      imports: [SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
      providers: [OrgManagementService, AppService]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
  });

  afterEach(async () => {
    await module.close();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('deepMerge', () => {
    it('should return the correct combination of json objects', async () => {
      expect(await service.deepMerge({}, {})).toEqual({});

      expect(
        await service.deepMerge(
          {
            property1: 'value1'
          },
          {
            property2: 'value2'
          }
        )
      ).toEqual({
        property1: 'value1',
        property2: 'value2'
      });

      expect(await service.deepMerge(undefined, undefined)).toEqual(undefined);

      expect(
        await service.deepMerge(
          {
            property: 'value1'
          },
          {
            property: 'value2'
          }
        )
      ).toEqual({ property: 'value2' });

      expect(
        await service.deepMerge(
          {
            property: {
              b: 'value1'
            }
          },
          {
            property: {
              c: 'value2'
            }
          }
        )
      ).toEqual({
        property: {
          b: 'value1',
          c: 'value2'
        }
      });

      expect(await service.deepMerge({}, { property: 'value' })).toEqual({
        property: 'value'
      });
    });
  });

  describe('getOrg', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should return an organisation', async () => {
      let testData = [];
      testData[SELECT] = [{ ...testOrg }];

      setTestData(testData);

      const { data } = await service.getOrg({ org_id: testOrg.org_id });
      expect(data).toBeDefined();
      expect(data[0]).toEqual(testOrg);
    });

    it('should throw a NotFoundException if the organisation does not exist', async () => {
      let testData = [];
      testData[SELECT] = [];

      setTestData(testData);

      await service.getOrg({ org_id: testOrg.org_id }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Organisation not found');
      });
    });

    it('should rethrow the error generated by the Supabase client', async () => {
      setTestData([]);

      let testError = [];
      testError[SELECT] = { message: 'An error occurred', status: 500 };

      setTestError(testError);

      await service.getOrg({ org_id: testOrg.org_id }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'An error occurred');
        expect(error).toHaveProperty('status', 500);
      });
    });
  });

  describe('getOrgLoggedIn', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('getOrgLoggedIn_H1', () => {
      beforeEach(async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when fetching the the org data', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        let org_ids = ['0000', '0001', '0002'];

        await service.getOrgLoggedIn_H1(org_ids).catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw a NotFoundException if the organisation was not found', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        let org_ids = ['0000', '0001', '0002'];

        await service.getOrgLoggedIn_H1(org_ids).catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Organisation not found');
        });
      });

      it('should return the organisations the user is a part of', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[SELECT] = [{ ...testOrg }];

        setTestData(testData);

        let org_ids = ['0000', '0001', '0002'];

        const { org_data } = await service.getOrgLoggedIn_H1(org_ids);
        expect(org_data).toBeDefined();
        expect(org_data[0]).toEqual(testData[SELECT][0]);
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      setTestData([]);

      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestError(testError);

      await service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client if there is an error when querying the database', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[SELECT] = { message: 'An error occurred', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'An error occurred');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException if the organisation was not found', async () => {
      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Organisation not found');
      });
    });

    it('should return the organisations the user is a part of', async () => {
      let testData = [];
      testData[SELECT] = [
        { org_id: '0000' },
        { org_id: '0001' },
        { org_id: '0002' }
      ];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      jest.spyOn(service, 'getOrgLoggedIn_H1').mockResolvedValue({
        org_data: [
          {
            ...testOrg,
            db_envs: []
          }
        ]
      });

      const { data } = await service.getOrgLoggedIn();
      expect(data).toBeDefined();
      expect(data[0]).toEqual({ ...testOrg, db_envs: [] });
    });
  });

  describe('getMembers', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('getMembers_H1', () => {
      it('should rethrow the error generated by the Supabase client when fetching the users member data from the database', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[AUTH] = {
          user: {
            id: '0000'
          }
        };

        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData(testData);
        setTestError(testError);

        await service.getMembers_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw an UnauthorizedException if the user is not a member of the organisation', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        await service.getMembers_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
      });

      it('should throw an UnauthorizedException if the user does not have the required permissions to view the members of the organisation', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[SELECT] = [
          {
            org_id: '0000',
            user_role: 'member',
            role_permissions: {
              add_dbs: false,
              is_owner: false,
              remove_dbs: false,
              update_dbs: false,
              invite_users: false,
              remove_users: false,
              view_all_dbs: false,
              view_all_users: false,
              update_db_access: false,
              update_user_roles: false
            }
          }
        ];

        setTestData(testData);

        await service.getMembers_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to view all members'
          );
        });
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found', async () => {
      setTestData([]);

      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestError(testError);

      await service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the member data for the organisation', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'getMembers_H1').mockResolvedValue();

      await service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException if the organisation has no members', async () => {
      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      jest.spyOn(service, 'getMembers_H1').mockResolvedValue();

      await service.getMembers({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Members not found');
      });
    });

    it('should return the members of the organisation', async () => {
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
      };

      setTestData(testData);

      jest.spyOn(service, 'getMembers_H1').mockResolvedValue();

      const { data } = await service.getMembers({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[SELECT]);
    });
  });

  describe('getDbs', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('getDbs_H1', () => {
      beforeEach(async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client after fetching member info', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[AUTH] = {
          user: {
            id: '0000'
          }
        };

        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData(testData);
        setTestError(testError);

        await service.getDbs_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw an UnauthorizedException when the user is not a part of the organisation', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        testData[SELECT] = [];
        testData[AUTH] = {
          user: {
            id: '0000'
          }
        };

        setTestData(testData);
        setTestError([]);

        await service.getDbs_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
      });

      it('should return the org_member info of the use of the organisation', async () => {
        let testData = [];
        testData[SELECT] = [
          {
            role_permissions: {
              view_all_dbs: true
            }
          }
        ];

        testData[AUTH] = {
          user: {
            id: '0000'
          }
        };

        setTestData(testData);

        const data = await service.getDbs_H1('0000', '0000');
        expect(data).toBeDefined();
        expect(data).toEqual(testData[SELECT]);
      });
    });

    describe('getDbs_H2', () => {
      beforeEach(async () => {
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when fetching the db data for the organisation', async () => {
        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        await service.getDbs_H2('0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw a NotFoundException if the organisation has no databases', async () => {
        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        await service.getDbs_H2('0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Databases not found');
        });
      });

      it('should return the databases of the organisation', async () => {
        let testData = [];
        testData[SELECT] = [
          {
            org_id: '0000',
            db_id: '0001',
            db_envs: {
              name: 'Test_DB1',
              type: 'mysql',
              created_at: '2024-07-25T19:47:09.164061+00:00'
            }
          },
          {
            org_id: '0000',
            db_id: '0002',
            db_envs: {
              name: 'Test_DB2',
              type: 'mysql',
              created_at: '2024-07-25T19:47:23.10072+00:00'
            }
          }
        ];

        setTestData(testData);

        const data = await service.getDbs_H2('0000');
        expect(data).toBeDefined();
        expect(data).toEqual(testData[SELECT]);
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found', async () => {
      setTestData([]);

      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestError(testError);

      await service.getDbs({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client after fetching the db data for the organisation', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: true
          }
        }
      ]);

      await service.getDbs({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: false
          }
        }
      ]);

      jest.spyOn(service, 'getDbs_H2').mockResolvedValue([]);

      await service.getDbs({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException when no databases have been found', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError([]);

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: true
          }
        }
      ]);

      await service.getDbs({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Databases not found');
      });

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: false
          }
        }
      ]);

      jest.spyOn(service, 'getDbs_H2').mockResolvedValue([
        {
          db_id: '0000'
        }
      ]);

      await service.getDbs({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Databases not found');
      });
    });

    it('should return the databases of the organisation that the user has access too', async () => {
      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          db_id: '0001',
          db_envs: {
            name: 'Test_DB1',
            type: 'mysql',
            created_at: '2024-07-25T19:47:09.164061+00:00'
          }
        },
        {
          org_id: '0000',
          db_id: '0002',
          db_envs: {
            name: 'Test_DB2',
            type: 'mysql',
            created_at: '2024-07-25T19:47:23.10072+00:00'
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: true
          }
        }
      ]);

      const { data: v1 } = await service.getDbs({ org_id: '0000' });
      expect(v1).toBeDefined();
      expect(v1).toEqual(testData[SELECT]);

      setTestData(testData);
      jest.spyOn(service, 'getDbs_H1').mockResolvedValue([
        {
          role_permissions: {
            view_all_dbs: false
          }
        }
      ]);

      jest.spyOn(service, 'getDbs_H2').mockResolvedValue([
        {
          db_id: '0001'
        }
      ]);

      const { data: v2 } = await service.getDbs({ org_id: '0000' });
      expect(v2).toBeDefined();
      expect(v2).toEqual(testData[SELECT]);
    });
  });

  describe('getOrgHash', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation hash data', async () => {
      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData([]);
      setTestError(testError);

      await service.getOrgHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException if the organisation hash does not exist', async () => {
      let testData = [];
      testData[SELECT] = [];

      setTestData(testData);

      await service.getOrgHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('No organisations match the provided hash');
      });
    });

    it('should return the organisation hash', async () => {
      let testData = [];
      testData[SELECT] = [{ org_id: '0000', hash: '0000' }];

      setTestData(testData);

      const { data } = await service.getOrgHash({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toBe(testData[SELECT]);
    });
  });

  describe('createOrg', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('createOrg_H1', () => {
      beforeEach(async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when inserting the owner member data into the organisation', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        let testError = [];

        testError[INSERT] = { message: 'Internal Server Error', status: 500 };

        setTestData(testData);
        setTestError(testError);

        await service.createOrg_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should attempt to delete the created organisation if the owner cannot be added as a member', async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');

        let testData = [];
        let testError = [];

        testData[INSERT] = [];
        testData[DELETE] = [{}];

        setTestData(testData);
        setTestError(testError);

        await service.createOrg_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Owner not added to organisation');
        });
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found, (no owner_id given)', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service.createOrg({ name: 'Test_Org' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when inserting the organisation data, (no owner_id given)', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.createOrg({ name: 'Test_Org' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should rethrow the error generated by the Supabase client when inserting the organisation data, (owner_id given)', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .createOrg({ name: 'Test_Org', owner_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerException when there is an error returning the created organisation', async () => {
      let testError = [];
      let testData = [];
      testError[INSERT] = {
        message: 'Internal Server Error',
        status: 500
      };

      setTestData([]);
      setTestError(testError);

      await service
        .createOrg({ name: 'Test_Org', owner_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerException when there is an error returning the created organisation', async () => {
      let testError = [];
      let testData = [];
      testData[INSERT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .createOrg({ name: 'Test_Org', owner_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Organisation not created');
        });
    });

    it('should return the organisation that was created', async () => {
      let testData = [];
      testData[INSERT] = [{ ...testOrg }];

      setTestData(testData);

      jest.spyOn(service, 'createOrg_H1').mockResolvedValue();

      const { data } = await service.createOrg({
        name: 'Test_Org',
        owner_id: '0000'
      });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('uploadOrgLogo', () => {
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('file content'),
      destination: '/path/to/destination',
      filename: 'test.jpg',
      path: '/path/to/destination/test.jpg',
      stream: null
    };

    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when trying to upload the file', async () => {
      let testError = [];
      testError[STORAGE] = { message: 'Internal Server Error', status: 500 };

      setTestData([]);
      setTestError(testError);

      await service.uploadOrgLogo(file, { org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an InternalServerErrorException when there is an error uploading the file', async () => {
      let testData = [];
      testData[STORAGE] = null;

      setTestData(testData);
      setTestError([]);

      await service.uploadOrgLogo(file, { org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to upload file');
      });
    });

    it('should return the public url of the uploaded file', async () => {
      let testData = [];
      testData[STORAGE] = 'https://test.com/image.jpg';

      setTestData(testData);

      const url = await service.uploadOrgLogo(file, { org_id: '0000' });
      expect(url).toBeDefined();
      expect(url).toBe(testData[STORAGE]);
    });
  });

  describe('join-org', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('joinOrg_H1', () => {
      beforeEach(async () => {
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when selecting the user from the organisation', async () => {
        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        await service
          .joinOrg_H1(
            [
              {
                org_id: '0000'
              }
            ],
            {
              user: {
                id: '0000'
              }
            }
          )
          .catch((error) => {
            expect(error).toBeDefined();
            expect(error).toHaveProperty('message', 'Internal Server Error');
            expect(error).toHaveProperty('status', 500);
          });
      });

      it('should throw a BadRequestException if the user is already added to the organisation', async () => {
        let testData = [];
        testData[SELECT] = [
          {
            org_id: '0000',
            user_id: '0001',
            user_role: 'member',
            role_permissions: {
              add_dbs: false,
              is_owner: false,
              remove_dbs: false,
              update_dbs: false,
              invite_users: false,
              remove_users: false,
              view_all_dbs: false,
              view_all_users: true,
              update_db_access: false,
              update_user_roles: false
            }
          }
        ];

        setTestData(testData);
        setTestError([]);

        await service
          .joinOrg_H1(
            [
              {
                org_id: '0000'
              }
            ],
            {
              user: {
                id: '0000'
              }
            }
          )
          .catch((error) => {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toBe('You are already a member of this org');
          });
      });

      it('should resolve if the user is not a member of the organisation', async () => {
        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        expect(
          await service.joinOrg_H1(
            [
              {
                org_id: '0000'
              }
            ],
            {
              user: {
                id: '0000'
              }
            }
          )
        ).toBeUndefined();
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service.joinOrg({ hash: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation hash', async () => {
      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      await service.joinOrg({ hash: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException if the organisation hash does not exist', async () => {
      let testData = [];

      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError([]);

      await service.joinOrg({ hash: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('No organisations match the provided hash');
      });
    });

    it('should rethrow the error generated by the Supabase client when inserting the user into the organisation', async () => {
      let testError = [];
      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      let testData = [];
      testData[SELECT] = [{ ...testOrg }];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'joinOrg_H1').mockResolvedValue();

      await service.joinOrg({ hash: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an InternalServerErrorException if the user cannot be added to the organisation', async () => {
      let testData = [];
      testData[SELECT] = [{ ...testOrg }];
      testData[INSERT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError([]);

      jest.spyOn(service, 'joinOrg_H1').mockResolvedValue();

      await service.joinOrg({ hash: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Member not added to organisation');
      });
    });

    it('should return the organisation that the user has joined', async () => {
      let testData = [];
      testData[SELECT] = [{ ...testOrg }];
      testData[INSERT] = [
        {
          org_id: '0000',
          user_id: '0001',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      jest.spyOn(service, 'joinOrg_H1').mockResolvedValue();

      const { data } = await service.joinOrg({ hash: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('createHash', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('createHash_H1', () => {
      it('should create the hash correctly', async () => {
        let hashCode = await service.createHash_H1('0000');
        expect(hashCode).toBeDefined();
      });
    });

    describe('createHash_H2', () => {
      it('should rethrow the error generated by the Supabase client when fetching the organisation hash data', async () => {
        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        await service.createHash_H2('0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should return true if the hash already exists', async () => {
        let testData = [];
        testData[SELECT] = [{ org_id: '0000', hash: '0000' }];

        setTestData(testData);

        const hashExists = await service.createHash_H2('0000');
        expect(hashExists).toBe(true);
      });

      it('should return false if the hash does not exist', async () => {
        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        const hashExists = await service.createHash_H2('0000');
        expect(hashExists).toBe(false);
      });
    });

    describe('createHash_H3', () => {
      describe('when createHash_H2 returns false', () => {
        it('should rethrow the error generated by the Supabase client when inserting the organisation hash data', async () => {
          let testError = [];
          testError[INSERT] = { message: 'Internal Server Error', status: 500 };

          setTestData([]);
          setTestError(testError);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(false);

          await service
            .createHash_H3({ org_id: '0000' }, '0000')
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toHaveProperty('message', 'Internal Server Error');
              expect(error).toHaveProperty('status', 500);
            });
        });

        it('should throw an InternalServerErrorException if the hash cannot be created', async () => {
          let testData = [];
          testData[INSERT] = [];

          setTestData(testData);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(false);

          await service
            .createHash_H3({ org_id: '0000' }, '0000')
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toBeInstanceOf(InternalServerErrorException);
              expect(error.message).toBe('Unable to save org hash');
            });
        });

        it('should return the hash that was created', async () => {
          let testData = [];
          testData[INSERT] = [{ org_id: '0000', hash: '0000' }];

          setTestData(testData);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(false);

          const { data } = await service.createHash_H3(
            { org_id: '0000' },
            '0000'
          );
          expect(data).toBeDefined();
          expect(data).toEqual(testData[INSERT]);
        });
      });

      describe('when createHash_H2 returns true', () => {
        it('should rethrow the error generated by the Supabase client when inserting the organisation hash data', async () => {
          let testError = [];
          testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

          setTestData([]);
          setTestError(testError);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(true);

          await service
            .createHash_H3({ org_id: '0000' }, '0000')
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toHaveProperty('message', 'Internal Server Error');
              expect(error).toHaveProperty('status', 500);
            });
        });

        it('should throw an InternalServerErrorException if the hash cannot be created', async () => {
          let testData = [];
          testData[UPDATE] = [];

          setTestData(testData);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(true);

          await service
            .createHash_H3({ org_id: '0000' }, '0000')
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toBeInstanceOf(InternalServerErrorException);
              expect(error.message).toBe('Unable to save org hash');
            });
        });

        it('should return the hash that was created', async () => {
          let testData = [];
          testData[UPDATE] = [{ org_id: '0000', hash: '0000' }];

          setTestData(testData);

          jest.spyOn(service, 'createHash_H2').mockResolvedValue(true);

          const { data } = await service.createHash_H3(
            { org_id: '0000' },
            '0000'
          );
          expect(data).toBeDefined();
          expect(data).toEqual(testData[UPDATE]);
        });
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service.createHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      await service.createHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a Unauthorised exception if the user is not a member of the organisation', async () => {
      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service.createHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('You are not a member of this organisation');
      });
    });

    it('should throw a Unauthorised exception if the user does not have the required permissions to create a hash', async () => {
      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service.createHash({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('You do not have permission to add members');
      });
    });

    it('should return the hash that was created', async () => {
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
            view_all_users: true,
            update_db_access: true,
            update_user_roles: true
          }
        }
      ];
      testData[INSERT] = [{ org_id: '0000', hash: '0000' }];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      jest.spyOn(service, 'createHash_H1').mockResolvedValue('0000');
      jest.spyOn(service, 'createHash_H2').mockResolvedValue(false);
      jest.spyOn(service, 'createHash_H3').mockResolvedValue({
        data: [{ org_id: '0000', hash: '0000' }],
        error: null
      });

      setTestData(testData);

      const { data } = await service.createHash({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });

    it('should return the hash that was updated', async () => {
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
            view_all_users: true,
            update_db_access: true,
            update_user_roles: true
          }
        }
      ];
      testData[INSERT] = [{ org_id: '0000', hash: '0000' }];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      jest.spyOn(service, 'createHash_H1').mockResolvedValue('0000');
      jest.spyOn(service, 'createHash_H2').mockResolvedValue(true);
      jest.spyOn(service, 'createHash_H3').mockResolvedValue({
        data: [{ org_id: '0000', hash: '0000' }],
        error: null
      });

      setTestData(testData);

      const { data } = await service.createHash({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('addMember', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching member data from the organisation', async () => {
      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not part of the organisation', async () => {
      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the required permissions to add a member', async () => {
      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: false,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to add members'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when updating the org member data', async () => {
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
            view_all_users: true,
            update_db_access: true,
            update_user_roles: true
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException if the user cannot be verified in the organisation', async () => {
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
            view_all_users: true,
            update_db_access: true,
            update_user_roles: true
          }
        }
      ];
      testData[UPDATE] = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);

      await service
        .addMember({ org_id: '0000', user_id: '0001' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Member not verified');
        });
    });

    it('should update the verified status of the user to true if the user is already a member of the organisation', async () => {
      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          user_id: '0000',
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
          }
        }
      ];
      testData[UPDATE] = [
        {
          org_id: '0000',
          user_id: '0001',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      testData[AUTH] = {
        user: {
          id: '0001'
        }
      };

      setTestData(testData);

      const { data } = await service.addMember({
        org_id: '0000',
        user_id: '0001'
      });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('addDb', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestData([]);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the users org member information', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the permissions to add a database', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: false,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe('You do not have permission to add dbs');
        });
    });

    it('should rethrow the error generated by the Supabase client when inserting into the org_dbs table', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException after deleting the created database since the db was not linked to the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[INSERT] = [];
      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database not added to organisation');
        });
    });

    it('should return the newly added database', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[INSERT] = [
        {
          db_id: 'c9967049-1b77-485e-b7bc-7d5be8220c71',
          created_at: '2024-07-30T12:53:42.575601+00:00',
          db_info: {},
          type: 'mysql',
          name: 'TestDB',
          host: '127.0.0.1'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.addDb({
        name: 'TestDB',
        org_id: '0000',
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('setUpTestScenatio', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    })

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      const mock_session = {}

      await service.setUpTestScenario(mock_session).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      const mock_session = {};

      await service.setUpTestScenario(mock_session).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      let testData = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      const mock_session = {}

      await service.setUpTestScenario(mock_session).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

  })

  describe('giveDbAccess', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when fetching the users name', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the users org member information', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the permissions to update db access', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: false,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to give database access to other users'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when inserting into the db_access table', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0001'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the db access was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0001'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[INSERT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database access not given');
        });
    });

    it('should return the updated db access', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[INSERT] = [
        {
          db_id: '0000',
          user_id: '0000',
          org_id: '0000'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.giveDbAccess({
        db_id: '0000',
        user_id: '0000',
        org_id: '0000'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('hasSavedDbCredentials', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestData([]);
      setTestError(testError);

      await service.hasSavedDbCredentials({ db_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should rethrow the error generated by the Supabase client when querying the db_access table', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.hasSavedDbCredentials({ db_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an error when the user does not have access to the database', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service.hasSavedDbCredentials({ db_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('You do not have access to this database');
      });
    });

    it('should return a object containing the property saved_db_credentials (false)', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          db_id: '0000',
          db_secrets: null
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const data = await service.hasSavedDbCredentials({ db_id: '0000' });

      expect(data).toBeDefined();
      expect(data).toHaveProperty('saved_db_credentials', false);
    });

    it('should return a object containing the property saved_db_credentials (true)', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          db_id: '0000',
          db_secrets: 'encrypted_secret'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const data = await service.hasSavedDbCredentials({ db_id: '0000' });

      expect(data).toBeDefined();
      expect(data).toHaveProperty('saved_db_credentials', true);
    });
  });

  describe('saveDbSecrets', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = '0000';

      await service
        .saveDbSecrets(
          {
            db_id: '0000',
            db_secrets: JSON.stringify({
              username: 'root',
              password: 'password'
            })
          },
          mock_session
        )
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should throw an InternalServerErrorException when the user does not have a session key', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      setTestData(testData);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = null;

      await service
        .saveDbSecrets(
          {
            db_id: '0000',
            db_secrets: JSON.stringify({
              username: 'root',
              password: 'password'
            })
          },
          mock_session
        )
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('You do not have a backend session');
        });
    })

    it('should rethrow the error generated by the Supabase client when updating the db_access table', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = '0000';

      jest
        .spyOn(service.app_service, 'encrypt')
        .mockReturnValueOnce('encrypted_secret_1');
      jest
        .spyOn(service.app_service, 'decrypt')
        .mockReturnValueOnce('encrypted_secret_2');

      await service
        .saveDbSecrets(
          {
            db_id: '0000',
            db_secrets: JSON.stringify({
              username: 'root',
              password: 'password'
            })
          },
          mock_session
        )
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the db secrets were not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[UPDATE] = [];

      setTestData(testData);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = '0000';

      jest
        .spyOn(service.app_service, 'encrypt')
        .mockReturnValueOnce('encrypted_secret_1');
      jest
        .spyOn(service.app_service, 'decrypt')
        .mockReturnValueOnce('encrypted_secret_2');

      await service
        .saveDbSecrets(
          {
            db_id: '0000',
            db_secrets: JSON.stringify({
              username: 'root',
              password: 'password'
            })
          },
          mock_session
        )
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database secrets not saved');
        });
    });

    it('should call the app_service.encryptSecrets method twice to encrypt the secrets', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[UPDATE] = [
        {
          db_id: '0000',
          db_secrets: 'encrypted_secret_1'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = '0000';

      jest
        .spyOn(service.app_service, 'encrypt')
        .mockReturnValueOnce('encrypted_secret_1');
      jest
        .spyOn(service.app_service, 'decrypt')
        .mockReturnValueOnce('encrypted_secret_2');

      await service.saveDbSecrets(
        {
          db_id: '0000',
          db_secrets: JSON.stringify({
            username: 'root',
            password: 'password'
          })
        },
        mock_session
      );

      expect(service.app_service.encrypt).toHaveBeenCalledTimes(2);
    });

    it('should return the updated db secrets', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[UPDATE] = [
        {
          db_id: '0000',
          db_secrets: 'encrypted_secret_1'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      let mock_session = require('express-session');
      mock_session.sessionKey = '0000';

      jest
        .spyOn(service.app_service, 'encrypt')
        .mockReturnValueOnce('encrypted_secret_1');
      jest
        .spyOn(service.app_service, 'decrypt')
        .mockReturnValueOnce('encrypted_secret_2');

      const { data } = await service.saveDbSecrets(
        {
          db_id: '0000',
          db_secrets: JSON.stringify({
            username: 'root',
            password: 'password'
          })
        },
        mock_session
      );

      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('updateOrg', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .updateOrg({ org_id: '0000', name: 'TestOrg' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateOrg({ org_id: '0000', name: 'TestOrg' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not the owner of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateOrg({ org_id: '0000', name: 'TestOrg' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not the owner of this organisation'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when updating the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateOrg({ org_id: '0000', name: 'TestOrg' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the updated organisation data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testData[UPDATE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateOrg({ org_id: '0000', name: 'TestOrg' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Organisation not updated');
        });
    });

    it('should return the updated organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testData[UPDATE] = [
        {
          org_id: '0000',
          name: 'TestOrg'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.updateOrg({
        org_id: '0000',
        name: 'TestOrg'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('updateMember', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('updateMember_H1', () => {
      beforeEach(async () => {
        const {
          setTestData,
          setTestError
        } = require('../supabase/supabase.ts');
        setTestData([]);
        setTestError([]);
      });

      describe('should set default role permissions when no role permissions are provided', () => {
        it('should rethrow the error generated by the Supabase client when fetching org member data', async () => {
          const {
            setTestData,
            setTestError
          } = require('../supabase/supabase.ts');
          let testError = [];
          testError[SELECT] = { message: 'Internal Server Error', status: 500 };

          setTestData([]);
          setTestError(testError);

          await service
            .updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member'
              },
              {
                user: {
                  id: '0000'
                }
              }
            )
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toHaveProperty('message', 'Internal Server Error');
              expect(error).toHaveProperty('status', 500);
            });
        });

        describe('should set the default role permissions for the member role', () => {
          it('should throw an UnauthorizedException when the user being updated is the owner of the organisation', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'owner'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'member'
                },
                {
                  user: {
                    id: '0001'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should throw an UnauthorizedException when the user being updated is the user themselves', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'member'
                },
                {
                  user: {
                    id: '0000'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should return a dto with the updated member data', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            const data = await service.updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member'
              },
              { user: { id: '0001' } }
            );

            expect(data).toBeDefined();
            expect(data).toEqual({
              org_id: '0000',
              user_id: '0000',
              user_role: 'member',
              role_permissions: {
                add_dbs: false,
                is_owner: false,
                remove_dbs: false,
                update_dbs: false,
                invite_users: false,
                remove_users: false,
                view_all_dbs: false,
                view_all_users: true,
                update_db_access: false,
                update_user_roles: false
              }
            });
          });
        });

        describe('should set the default role permissions for the admin role', () => {
          it('should throw an UnauthorizedException when the user being updated is the owner of the organisation', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'owner'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'admin'
                },
                {
                  user: {
                    id: '0001'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should throw an UnauthorizedException when the user being updated is the user themselves', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'admin'
                },
                {
                  user: {
                    id: '0000'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should return a dto with the updated member data', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin'
              }
            ];

            setTestData(testData);
            setTestError(testError);

            const data = await service.updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin'
              },
              { user: { id: '0001' } }
            );

            expect(data).toBeDefined();
            expect(data).toEqual({
              org_id: '0000',
              user_id: '0000',
              user_role: 'admin',
              role_permissions: {
                is_owner: false,
                add_dbs: true,
                update_dbs: true,
                remove_dbs: true,
                invite_users: true,
                remove_users: true,
                update_user_roles: true,
                view_all_dbs: true,
                view_all_users: true,
                update_db_access: true
              }
            });
          });
        });
      });

      describe('should set default role permissions when some or all role permissions are provided', () => {
        it('should rethrow the error generated by the Supabase client when fetching org member data', async () => {
          const {
            setTestData,
            setTestError
          } = require('../supabase/supabase.ts');
          let testError = [];
          testError[SELECT] = { message: 'Internal Server Error', status: 500 };

          setTestData([]);
          setTestError(testError);

          await service
            .updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member',
                role_permissions: {
                  add_dbs: true
                }
              },
              {
                user: {
                  id: '0000'
                }
              }
            )
            .catch((error) => {
              expect(error).toBeDefined();
              expect(error).toHaveProperty('message', 'Internal Server Error');
              expect(error).toHaveProperty('status', 500);
            });
        });

        describe('should set the default role permissions for the member role', () => {
          it('should throw an UnauthorizedException when the user being updated is the owner of the organisation', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
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
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'member',
                  role_permissions: {
                    add_dbs: false
                  }
                },
                {
                  user: {
                    id: '0001'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should throw an UnauthorizedException when the user being updated is the user themselves', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member',
                role_permissions: {
                  add_dbs: false,
                  is_owner: false,
                  remove_dbs: false,
                  update_dbs: false,
                  invite_users: false,
                  remove_users: false,
                  view_all_dbs: false,
                  view_all_users: false,
                  update_db_access: false,
                  update_user_roles: false
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'member',
                  role_permissions: {
                    add_dbs: true
                  }
                },
                {
                  user: {
                    id: '0000'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should return a dto with the updated member data', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member',
                role_permissions: {
                  add_dbs: false,
                  is_owner: false,
                  remove_dbs: false,
                  update_dbs: false,
                  invite_users: false,
                  remove_users: false,
                  view_all_dbs: false,
                  view_all_users: true,
                  update_db_access: false,
                  update_user_roles: false
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            const data = await service.updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'member',
                role_permissions: {
                  add_dbs: true
                }
              },
              { user: { id: '0001' } }
            );

            expect(data).toBeDefined();
            expect(data).toEqual({
              org_id: '0000',
              user_id: '0000',
              user_role: 'member',
              role_permissions: {
                add_dbs: true,
                is_owner: false,
                remove_dbs: false,
                update_dbs: false,
                invite_users: false,
                remove_users: false,
                view_all_dbs: false,
                view_all_users: true,
                update_db_access: false,
                update_user_roles: false
              }
            });
          });
        });

        describe('should set the default role permissions for the admin role', () => {
          it('should throw an UnauthorizedException when the user being updated is the owner of the organisation', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
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
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'admin',
                  role_permissions: {
                    add_dbs: false
                  }
                },
                {
                  user: {
                    id: '0001'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should throw an UnauthorizedException when the user being updated is the user themselves', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin',
                role_permissions: {
                  is_owner: false,
                  add_dbs: true,
                  update_dbs: true,
                  remove_dbs: true,
                  invite_users: true,
                  remove_users: true,
                  update_user_roles: false,
                  view_all_dbs: true,
                  view_all_users: true,
                  update_db_access: false
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            await service
              .updateMember_H1(
                {
                  org_id: '0000',
                  user_id: '0000',
                  user_role: 'admin',
                  role_permissions: {
                    add_dbs: true
                  }
                },
                {
                  user: {
                    id: '0000'
                  }
                }
              )
              .catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You cannot update this users role');
              });
          });

          it('should return a dto with the updated member data', async () => {
            const {
              setTestData,
              setTestError
            } = require('../supabase/supabase.ts');
            let testError = [];
            let testData = [];

            testData[AUTH] = {
              user: {
                id: '0000'
              }
            };

            testData[SELECT] = [
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin',
                role_permissions: {
                  is_owner: false,
                  add_dbs: true,
                  update_dbs: true,
                  remove_dbs: true,
                  invite_users: true,
                  remove_users: true,
                  update_user_roles: false,
                  view_all_dbs: true,
                  view_all_users: true,
                  update_db_access: false
                }
              }
            ];

            setTestData(testData);
            setTestError(testError);

            const data = await service.updateMember_H1(
              {
                org_id: '0000',
                user_id: '0000',
                user_role: 'admin',
                role_permissions: {
                  add_dbs: false
                }
              },
              { user: { id: '0001' } }
            );

            expect(data).toBeDefined();
            expect(data).toEqual({
              org_id: '0000',
              user_id: '0000',
              user_role: 'admin',
              role_permissions: {
                is_owner: false,
                add_dbs: false,
                update_dbs: true,
                remove_dbs: true,
                invite_users: true,
                remove_users: true,
                update_user_roles: false,
                view_all_dbs: true,
                view_all_users: true,
                update_db_access: false
              }
            });
          });
        });
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the permissions to update user roles', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: false,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to update user roles'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when updating the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'updateMember_H1').mockResolvedValue({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the updated organisation data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[UPDATE] = [];

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'updateMember_H1').mockResolvedValue({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      await service
        .updateMember({
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Member not updated');
        });
    });

    it('should return the updated organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[UPDATE] = [
        {
          org_id: '0000',
          user_id: '0000',
          user_role: 'member'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      jest.spyOn(service, 'updateMember_H1').mockResolvedValue({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      const { data } = await service.updateMember({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('updateDb', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the permissions to update databases', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: false,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to update databases'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when updating the database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the updated database data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[UPDATE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .updateDb({ org_id: '0000', db_id: '0000', name: 'TestDb' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database not updated');
        });
    });

    it('should return the updated database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[UPDATE] = [
        {
          org_id: '0000',
          db_id: '0000',
          name: 'TestDb'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.updateDb({
        org_id: '0000',
        db_id: '0000',
        name: 'TestDb'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('removeOrg', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service.removeOrg({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Not logged in');
        expect(error).toHaveProperty('status', 401);
      });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.removeOrg({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an UnauthorizedException when the user is not the owner of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service.removeOrg({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'You are not the owner of this organisation'
        );
      });
    });

    it('should rethrow the error generated by the Supabase client when removing the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testError[DELETE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.removeOrg({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an InternalServerErrorException when the removed organisation data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      await service.removeOrg({ org_id: '0000' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Organisation not removed');
      });
    });

    it('should return the removed organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'owner'
        }
      ];

      testData[DELETE] = [
        {
          org_id: '0000'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.removeOrg({ org_id: '0000' });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[DELETE]);
    });
  });

  describe('removeMember', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the organisation data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the required permissions to remove members', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
        });
    });

    it('should rethrow the error generated by the Supabase client when removing the member data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[DELETE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the removed member data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeMember({ org_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Member not removed');
        });
    });

    it('should return the removed member data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [
        {
          org_id: '0000',
          user_id: '0000'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.removeMember({
        org_id: '0000',
        user_id: '0000'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[DELETE]);
    });
  });

  describe('removeDb', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the required permissions to remove databases', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to remove databases'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when removing the database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[DELETE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the removed database data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDb({ org_id: '0000', db_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database not removed');
        });
    });

    it('should return the removed database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [
        {
          org_id: '0000',
          db_id: '0000'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.removeDb({
        org_id: '0000',
        db_id: '0000'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[DELETE]);
    });
  });

  describe('removeDbAccess', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching the database data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an UnauthorizedException when the user is not a member of the organisation', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
    });

    it('should throw an UnauthorizedException when the user does not have the required permissions to update database access', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
          role_permissions: {
            add_dbs: false,
            is_owner: false,
            remove_dbs: false,
            update_dbs: false,
            invite_users: false,
            remove_users: false,
            view_all_dbs: false,
            view_all_users: true,
            update_db_access: false,
            update_user_roles: false
          }
        }
      ];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to remove database access for other users'
          );
        });
    });

    it('should rethrow the error generated by the Supabase client when removing the database access data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testError[DELETE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when the removed database access data was not returned', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .removeDbAccess({ org_id: '0000', db_id: '0000', user_id: '0000' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Database access not removed');
        });
    });

    it('should return the removed database access data', async () => {
      let testError = [];
      let testData = [];

      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'admin',
          role_permissions: {
            add_dbs: true,
            is_owner: false,
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
      ];

      testData[DELETE] = [
        {
          org_id: '0000',
          db_id: '0000',
          user_id: '0000'
        }
      ];

      setTestData(testData);
      setTestError(testError);

      const { data } = await service.removeDbAccess({
        org_id: '0000',
        db_id: '0000',
        user_id: '0000'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[DELETE]);
    });
  });
});
