import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { SupabaseModule } from '../supabase';
import {
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';

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

  describe('updateUser', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      let testData = [];

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };
      testData[AUTH] = { user: null };

      setTestError(testError);
      setTestData(testData);

      await service
        .updateUser({
          first_name: 'John',
          last_name: 'Doe'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should rethrow the error generated by the Supabase client when updating the user', async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testError[UPDATE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .updateUser({
          first_name: 'John',
          last_name: 'Doe'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toHaveProperty('message', 'Internal Server Error');
          expect(error).toHaveProperty('status', 500);
        });
    });

    it('should throw a NotFoundException when the user is not found', async () => {
      let testData = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[UPDATE] = [];

      setTestData(testData);

      await service
        .updateUser({
          first_name: 'John',
          last_name: 'Doe'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('User not found');
        });
    });

    it('should return the user data when the user is updated', async () => {
      let testData = [];
      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[UPDATE] = [{ user_id: 'test_user_id' }];

      setTestData(testData);

      const { data } = await service.updateUser({
        first_name: 'John',
        last_name: 'Doe'
      });

      expect(data).toBeDefined();
      expect(data).toEqual(testData[UPDATE]);
    });
  });

  describe('uploadProfilePhoto', () => {
    beforeEach(() => {
      setTestData([]);
      setTestError([]);
    });

    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testError = [];
      let testData = [];

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

      testError[AUTH] = { message: 'Internal Server Error', status: 500 };
      testData[AUTH] = { user: null };

      setTestError(testError);
      setTestData(testData);

      await service.uploadProfilePhoto(file).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should rethrow the error generated by the Supabase client when uploading the profile photo', async () => {
      let testData = [];
      let testError = [];

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

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testError[STORAGE] = { message: 'Internal Server Error', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service.uploadProfilePhoto(file).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toHaveProperty('message', 'Internal Server Error');
        expect(error).toHaveProperty('status', 500);
      });
    });

    it('should throw an InternalServerErrorException when the data is null', async () => {
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

      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[STORAGE] = null;

      setTestData(testData);
      setTestError(testError);

      await service.uploadProfilePhoto(file).catch((error) => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to upload file');
      });
    });

    it('should return the image URL when the profile photo is uploaded', async () => {
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

      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'test_user_id' } };
      testData[STORAGE] = { url: 'https://example.com/test.jpg' };

      setTestData(testData);
      setTestError(testError);

      const img_url = await service.uploadProfilePhoto(file);
      expect(img_url).toBeDefined();

      expect(img_url).toEqual(testData[STORAGE]);
    })
  });

  describe('updateUserPassword', () => {
    it('should return a message stating it is not implemented', async () => {
      const { data } = await service.updateUserPassword({
        user_id: 'test_user_id'
      });
      expect(data).toBeDefined();
      expect(data).toBe('Not implemented');
    })
  });

  describe('updateUserEmail', () => {
    it('should return a message stating it is not implemented', async () => {
      const { data } = await service.updateUserEmail({
        user_id: 'test_user_id'
      });
      expect(data).toBeDefined();
      expect(data).toBe('Not implemented');
    });
  });

  describe('updateUserPhone', () => {
    it('should return a message stating it is not implemented', async () => {
      const { data } = await service.updateUserPhone({
        user_id: 'test_user_id'
      });
      expect(data).toBeDefined();
      expect(data).toBe('Not implemented');
    });
  });
});
