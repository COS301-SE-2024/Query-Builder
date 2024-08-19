import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import exp from 'node:constants';
import { stat } from 'node:fs';

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

describe('ConnectionManagerService', () => {
  let service: ConnectionManagerService;

  const { setTestData, setTestError } = require('../supabase/supabase.ts');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SupabaseModule,
        ConfigModule.forRoot({ isGlobal: true }),
        SessionStoreModule,
        MyLoggerModule
      ],
      providers: [ConnectionManagerService, AppService, ConfigService]
    }).compile();

    service = module.get<ConnectionManagerService>(ConnectionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connectToDatabase', () => {});

  describe('decryptDbSecrets', () => {
    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      let testData = [];
      let testError = [];

      testError[AUTH] = { message: 'User not logged in', status: 401 };

      setTestData(testData);
      setTestError(testError);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toEqual(testError[AUTH]);
        });
    });

    it('should rethrow the error generated by the Supabase client when the user is not authorized', async () => {
      let testData = [];
      let testError = [];

      testError[SELECT] = { message: 'User not authorized', status: 403 };

      setTestData(testData);
      setTestError(testError);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toEqual(testError[AUTH]);
        });
    });
  });
});
