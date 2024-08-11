import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { Supabase, SupabaseModule } from '../supabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Module,
  NotFoundException
} from '@nestjs/common';
import { Create_User_Dto } from './dto/create-user.dto';
import { Get_User_Dto } from './dto/get-user.dto';
import { Sign_In_User_Dto } from './dto/sign-in-user.dto';
import { Update_User_Dto } from './dto/update-user.dto';
import exp from 'constants';

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
              signUp: jest.fn().mockReturnThis(),
              signInWithPassword: jest.fn().mockReturnThis(),
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

describe('UserManagementService', () => {
  const { setTestData, setTestError } = require('../supabase/supabase.ts');

  let service: UserManagementService;
  let module: TestingModule;

  let testUser = {
    email: null,
    password: 'password',
    first_name: 'Test',
    last_name: 'User',
    user_id: null
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SupabaseModule],
      providers: [UserManagementService]
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
  });

  afterEach(async () => {
    await module.close();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when getting a user', async () => {
      let testData = [];
      let testError = [];

      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.getUser({ user_id: 'test_user_id' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException when the user is not found', async () => {
      let testData = [];

      testData[SELECT] = [];

      setTestData(testData);

      await service.getUser({ user_id: 'test_user_id' }).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      });
    });

    it('should return the user data when the user is found', async () => {
      let testData = [];
      testData[SELECT] = [{ user_id: 'test_user_id' }];

      setTestData(testData);

      const { data } = await service.getUser({ user_id: 'test_user_id' });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[SELECT]);
    });
  });

  describe('getLoggedInUser', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when getting the logged in user', async () => {
      let testData = [];
      let testError = [];

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.getLoggedInUser().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should rethrow the error generated by the Supabase client when getting the logged in user profile', async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testError[SELECT] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.getLoggedInUser().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw a NotFoundException when the user is not found', async () => {
      let testData = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[SELECT] = [];

      setTestData(testData);

      await service.getLoggedInUser().catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      });
    });

    it('should return the user data when the user is found', async () => {
      let testData = [];
      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[SELECT] = [{ user_id: 'test_user_id' }];

      setTestData(testData);

      const { data } = await service.getLoggedInUser();
      expect(data).toBeDefined();
      expect(data).toEqual(testData[SELECT]);
    });
  });

  describe('genSessionKey', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should return a success message when the session key is generated', async () => {
      const session = {};
      const { data } = await service.genSessionKey(
        { email: 'test@example.com', password: 'password' },
        session
      );
      expect(data).toBeDefined();
      expect(data).toHaveProperty('success', true);
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when signing in', async () => {
      let testError = [];

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestError(testError);

      await service
        .signIn({ email: 'test@example.com', password: 'password' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should return the user data when the user is signed in', async () => {
      let testData = [];
      testData[AUTH] = { user: { id: 'test_user_id' } };

      setTestData(testData);

      const { data } = await service.signIn({
        email: 'test@example,com',
        password: 'password'
      });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[AUTH]);
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when signing up', async () => {
      let testError = [];

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };

      setTestError(testError);

      await service
        .signUp({
          email: 'test@example.com',
          password: 'password',
          first_name: 'John',
          last_name: 'Doe'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should return the user data when the user is signed up', async () => {
      let testData = [];
      testData[AUTH] = { user: { id: 'test_user_id' } };

      setTestData(testData);

      const { data } = await service.signUp({
        email: 'test@example.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe'
      });
      expect(data).toBeDefined();
      expect(data).toEqual(testData[AUTH]);
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when creating a user', async () => {
      let testError = [];

      testError[AUTH_ADMIN] = { message: 'Internal Server Error', status: 500 };

      setTestError(testError);

      await service
        .createUser({
          email: 'test@example.com',
          password: 'password',
          first_name: 'John',
          last_name: 'Doe'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should return the user data when the user is created', async () => {
      let testData = [];
      testData[AUTH_ADMIN] = { id: 'test_user_id' };

      setTestData(testData);

      const { data } = await service.createUser({
        email: 'test@example.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[AUTH_ADMIN]);
    });
  });
  
  describe('updateUser', () => {});
  describe('uploadProfilePicture', () => {});
  describe('updateUserPassword', () => {});
  describe('updateUserEmail', () => {});
  describe('updateUserPhone', () => {});
});
