import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import {
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common';
import { AppService } from '../app.service';
import { describe, mock } from 'node:test';

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

describe('OrgManagementService', () => {
  const { setTestData, setTestError } = require('../supabase/supabase.ts');
  let service: OrgManagementService;

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
      imports: [SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
      providers: [OrgManagementService, AppService]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
  });

  afterEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
      providers: [OrgManagementService, AppService]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
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
    });
  });

  describe('getOrg', () => {
    beforeEach(() => {
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

      service.getOrg({ org_id: testOrg.org_id }).catch((error) => {
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

      service.getOrg({ org_id: testOrg.org_id }).catch((error) => {
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
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when fetching the the org data', async () => {
        let testError = [];
        testError[SELECT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        let org_ids = ['0000', '0001', '0002'];

        service.getOrgLoggedIn_H1(org_ids).catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw a NotFoundException if the organisation was not found', async () => {
        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        let org_ids = ['0000', '0001', '0002'];

        service.getOrgLoggedIn_H1(org_ids).catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Organisation not found');
        });
      });

      it('should return the organisations the user is a part of', async () => {
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

      service.getOrgLoggedIn().catch((error) => {
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

      service.getOrgLoggedIn().catch((error) => {
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

      service.getOrgLoggedIn().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Organisation not found');
      });
    });

    it('should return the organisations the user is a part of', async () => {
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
      setTestData([]);
      setTestError([]);
    });

    describe('getMembers_H1', () => {
      it('should rethrow the error generated by the Supabase client when fetching the users member data from the database', async () => {
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

        service.getMembers_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw an UnauthorizedException if the user is not a member of the organisation', async () => {
        let testData = [];
        testData[SELECT] = [];

        setTestData(testData);

        service.getMembers_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
      });

      it('should throw an UnauthorizedException if the user does not have the required permissions to view the members of the organisation', async () => {
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

        service.getMembers_H1('0000', '0000').catch((error) => {
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

      service.getMembers({ org_id: '0000' }).catch((error) => {
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

      service.getMembers({ org_id: '0000' }).catch((error) => {
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

      service.getMembers({ org_id: '0000' }).catch((error) => {
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
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client after fetching member info', async () => {
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

        service.getDbs_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should throw an UnauthorizedException when the user is not a part of the organisation', async () => {
        let testData = [];
        testData[SELECT] = [];
        testData[AUTH] = {
          user: {
            id: '0000'
          }
        };

        setTestData(testData);
        setTestError([]);

        service.getDbs_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You are not a member of this organisation'
          );
        });
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in or cannot be found', async () => {
      setTestData([]);

      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestError(testError);

      service.getDbs({ org_id: '0000' }).catch((error) => {
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

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue();

      service.getDbs({ org_id: '0000' }).catch((error) => {
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

      jest.spyOn(service, 'getDbs_H1').mockResolvedValue();

      service.getDbs({ org_id: '0000' }).catch((error) => {
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
      jest.spyOn(service, 'getDbs_H1').mockResolvedValue();

      const { data } = await service.getDbs({ org_id: '0000' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[SELECT]);
    });
  });

  describe('createOrg', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('createOrg_H1', () => {
      beforeEach(async () => {
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when inserting the owner member data into the organisation', async () => {
        let testData = [];
        let testError = [];

        testError[INSERT] = { message: 'Internal Server Error', status: 500 };

        setTestData(testData);
        setTestError(testError);

        service.createOrg_H1('0000', '0000').catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
      });

      it('should attempt to delete the created organisation if the owner cannot be added as a member', async () => {
        let testData = [];
        let testError = [];

        testData[INSERT] = [];
        testData[DELETE] = [{}];

        setTestData(testData);
        setTestError(testError);

        service.createOrg_H1('0000', '0000').catch((error) => {
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

      service.createOrg({ name: 'Test_Org' }).catch((error) => {
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

      service.createOrg({ name: 'Test_Org' }).catch((error) => {
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

      service
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

      service
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

      service
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

      service.uploadOrgLogo(file, { org_id: '0000' }).catch((error) => {
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

      service.uploadOrgLogo(file, { org_id: '0000' }).catch((error) => {
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

      service
        .addMember({ org_id: '0000', user_id: '0001', user_role: 'member' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Not logged in');
          expect(error).toHaveProperty('status', 401);
        });
    });

    it('should rethrow the error generated by the Supabase client when fetching member data from the organisation', async () => {
      let testData = [];
      testData[SELECT] = [];
      testData[AUTH] = {
        user: {
          id: '0000'
        }
      };

      let testError = [];
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      service
        .addMember({ org_id: '0000', user_id: '0001', user_role: 'member' })
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

      service
        .addMember({ org_id: '0000', user_id: '0001', user_role: 'member' })
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

      service
        .addMember({ org_id: '0000', user_id: '0001', user_role: 'member' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe(
            'You do not have permission to add members'
          );
        });
    });

    it('should set role_perms to default values for the type of user_role that the new member will have (member)', async () => {
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

      testData[INSERT] = [
        {
          created_at: 'now',
          org_id: '0000',
          user_role: 'member',
          user_id: '0000',
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

      const { data } = await service.addMember({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });

    it('should set role_perms to default values for the type of user_role that the new member will have (admin)', async () => {
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

      testData[INSERT] = [
        {
          created_at: 'now',
          org_id: '0000',
          user_role: 'admin',
          user_id: '0000',
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

      setTestData(testData);

      const { data } = await service.addMember({
        org_id: '0000',
        user_id: '0000',
        user_role: 'admin'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });

    it('should rethrow the error generated by Supabase when adding member into the organisation', async () => {
      let testData = [];
      testData[SELECT] = [
        {
          org_id: '0000',
          user_role: 'member',
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
      testError[INSERT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      service
        .addMember({ org_id: '0000', user_id: '0000', user_role: 'member' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw an InternalServerErrorException when there is no data returned after a member is added into the organisation', async () => {
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

      testData[INSERT] = [];

      setTestData(testData);

      service
        .addMember({ org_id: '0000', user_id: '0000', user_role: 'member' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Member not added to organisation');
        });
    });

    it('should return the newly added member', async () => {
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

      testData[INSERT] = [
        {
          created_at: 'now',
          org_id: '0000',
          user_role: 'member',
          user_id: '0000',
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

      const { data } = await service.addMember({
        org_id: '0000',
        user_id: '0000',
        user_role: 'member'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[INSERT]);
    });
  });

  describe('addDb', () => {
    beforeEach(async () => {
      setTestData([]);
      setTestError([]);
    });

    describe('addDb_H1', () => {
      beforeEach(async () => {
        setTestData([]);
        setTestError([]);
      });

      it('should rethrow the error generated by the Supabase client when inserting a new database into db_envs', async () => {
        let testError = [];
        testError[INSERT] = { message: 'Internal Server Error', status: 500 };

        setTestData([]);
        setTestError(testError);

        service
          .addDb_H1({
            name: 'TestDB',
            org_id: '0000',
            type: 'mysql',
            host: '127.0.0.1'
          })
          .catch((error) => {
            expect(error).toBeDefined();
            expect(error).toHaveProperty('message', 'Internal Server Error');
            expect(error).toHaveProperty('status', 500);
          });
      });
      it('should throw an InternalServerErrorException when the the newly inserted database was not returned', async () => {
        let testData = [];
        testData[INSERT] = [];

        setTestData(testData);
        setTestError([]);

        service
          .addDb_H1({
            name: 'TestDB',
            org_id: '0000',
            type: 'mysql',
            host: '127.0.0.1'
          })
          .catch((error) => {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Database not added');
          });
      });
      it('should return the newly inserted database', async () => {
        let testData = [];
        testData[INSERT] = [
          {
            db_id: '0000',
            created_at: 'now',
            db_info: {},
            type: 'mysql',
            name: 'TestDB',
            host: '127.0.0.1'
          }
        ];

        setTestData(testData);
        setTestError([]);

        const { db_data } = await service.addDb_H1({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
        });

        expect(db_data).toBeDefined();
        expect(db_data).toEqual(testData[INSERT]);
      });
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestData([]);
      setTestError(testError);

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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

      jest.spyOn(service, 'addDb_H1').mockResolvedValue({
        db_data: [
          {
            db_id: 'c9967049-1b77-485e-b7bc-7d5be8220c71',
            created_at: '2024-07-30T12:53:42.575601+00:00',
            db_info: {},
            type: 'mysql',
            name: 'TestDB',
            host: '127.0.0.1'
          }
        ]
      });

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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

      jest.spyOn(service, 'addDb_H1').mockResolvedValue({
        db_data: [
          {
            db_id: 'c9967049-1b77-485e-b7bc-7d5be8220c71',
            created_at: '2024-07-30T12:53:42.575601+00:00',
            db_info: {},
            type: 'mysql',
            name: 'TestDB',
            host: '127.0.0.1'
          }
        ]
      });

      service
        .addDb({
          name: 'TestDB',
          org_id: '0000',
          type: 'mysql',
          host: '127.0.0.1'
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
          org_id: '0000',
          db_id: '0000'
        }
      ];

      testData[DELETE] = [];

      setTestData(testData);
      setTestError(testError);

      let { db_data } = {
        db_data: [
          {
            db_id: 'c9967049-1b77-485e-b7bc-7d5be8220c71',
            created_at: '2024-07-30T12:53:42.575601+00:00',
            db_info: {},
            type: 'mysql',
            name: 'TestDB',
            host: '127.0.0.1'
          }
        ]
      };

      jest.spyOn(service, 'addDb_H1').mockResolvedValue({ db_data });

      const { data } = await service.addDb({
        name: 'TestDB',
        org_id: '0000',
        type: 'mysql',
        host: '127.0.0.1'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(db_data);
    });
  });

  describe('giveDbAccess', () => {
    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      testError[AUTH] = { message: 'Not logged in', status: 401 };

      setTestData([]);
      setTestError(testError);

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
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

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
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

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
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

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe('You do not have permission to update db access');
        });
    });
    
    it('should rethrow the error generated by the Supabase client when inserting into the db_access table', async () => {
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

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
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

      setTestData(testData);
      setTestError(testError);

      service
        .giveDbAccess({
          db_id: '0000',
          user_id: '0000',
          org_id: '0000',
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Db access not added');
        });
    });
    it('should return the updated db access', async () => {});
  });
  describe('saveDbSecrets', () => {});
  describe('updateOrg', () => {});
  describe('updateMember', () => {});
  describe('updateMemberHelper', () => {});
  describe('updateDb', () => {});
  describe('removeOrg', () => {});
  describe('removeMember', () => {});
  describe('removeDb', () => {});
  describe('removeDbAccess', () => {});
  // TODO: LOOK OVER PREVIOUS TESTS TO ADD SPY ON THINGS TO REACH 100% COVERAGE
});
