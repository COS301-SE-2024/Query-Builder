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
              single: jest.fn().mockReturnThis(),
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

class MockConnectionManagerService extends ConnectionManagerService {
  async connectToDatabase(connect_dto: any, session: Record<string, any>) {
    return { success: true, connectionID: 1 };
  }

  async hasActiveConnection(
    has_active_connection_dto: any,
    session: Record<string, any>
  ) {
    return super.hasActiveConnection(has_active_connection_dto, session);
  }

  async decryptDbSecrets(db_id: string, session: Record<string, any>) {
    return super.decryptDbSecrets(db_id, session);
  }
}

class MockConfigService {
  get(key: string) {
    return key;
  }
}

class MockAppService {
  decrypt(data: string, key: string) {
    return '{"user": "test", "password": "test"}';
  }
}

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
      providers: [
        {
          provide: ConnectionManagerService,
          useClass: MockConnectionManagerService
        },
        {
          provide: AppService,
          useClass: MockAppService
        },
        {
          provide: ConfigService,
          useClass: MockConfigService
        }
      ]
    }).compile();

    service = module.get<ConnectionManagerService>(ConnectionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connectToDatabase', () => {
    it('should be defined', () => {
      expect(service.connectToDatabase).toBeDefined();
    });
  });

  describe('hasActiveConnection', () => {
    it('should rethrow the error generated by the Supabase client when fetching the database', async () => {
      let testData = [];
      let testError = [];

      testError[SELECT] = { message: 'Internal Server Exception', status: 500 };

      setTestData(testData);
      setTestError(testError);

      await service
        .hasActiveConnection({ databaseServerID: 'db_id' }, { host: 'host' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toEqual(testError[SELECT]);
        });
    });

    it('should throw an error when the database does not exist', async () => {
      let testData = [];
      let testError = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .hasActiveConnection({ databaseServerID: 'db_id' }, { host: 'host' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual(
            'You do not have access to this database'
          );
        });
    });

    it('should return true when the user has an active connection to the database server', async () => {
      let testData = [];
      let testError = [];

      testData[SELECT] = { host: 'host', port: 'port' };

      setTestData(testData);
      setTestError(testError);

      const result = await service.hasActiveConnection(
        { databaseServerID: 'db_id' },
        { host: 'host', port: 'port' }
      );

      expect(result).toEqual({ hasActiveConnection: true });
    });

    it('should return false when the user does not have an active connection to the database server', async () => {
      let testData = [];
      let testError = [];

      testData[SELECT] = { host: 'host', port: 'port' };

      setTestData(testData);
      setTestError(testError);

      const result = await service.hasActiveConnection(
        { databaseServerID: 'db_id' },
        { host: 'host', port: 'port2' }
      );

      expect(result).toEqual({ hasActiveConnection: false });
    });
  });

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

    it('should rethrow the error generated by the Supabase client when there is an error querying the db_access table', async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'user_id' } };
      testError[SELECT] = { message: 'Database not found', status: 404 };

      setTestData(testData);
      setTestError(testError);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toEqual(testError[SELECT]);
        });
    });

    it('should rethrow the error generated by the Supabase client when the database secret is not found', async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'user_id' } };
      testData[SELECT] = [];

      setTestData(testData);
      setTestError(testError);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual(
            'Database secret not found, you do not have access to this database'
          );
        });
    });

    it('should return the database secret when it is found', async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'user_id' } };
      testData[SELECT] = [{ db_secrets: 'db_secrets' }];

      setTestData(testData);
      setTestError(testError);

      const result = await service.decryptDbSecrets('db_id', {
        host: 'host',
        sessionKey: 'session'
      });

      expect(result.user).toEqual('test');
      expect(result.password).toEqual('test');
    });

    it("should throw an InternalServerErrorException when the user doesn't have a session", async () => {
      let testData = [];
      let testError = [];

      testData[AUTH] = { user: { id: 'user_id' } };
      testData[SELECT] = [{ db_secrets: 'db_secrets' }];

      setTestData(testData);
      setTestError(testError);

      await service
        .decryptDbSecrets('db_id', {
          host: 'host'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual('You do not have a backend session');
        });
    });

    // it('should rethrow the error generated by the Supabase client when the user is not authorized', async () => {
    //   let testData = [];
    //   let testError = [];

    //   testError[SELECT] = { message: 'User not authorized', status: 403 };

    //   setTestData(testData);
    //   setTestError(testError);

    //   await service
    //     .decryptDbSecrets('db_id', { host: 'host' })
    //     .catch((error) => {
    //       expect(error).toEqual(testError[AUTH]);
    //     });
    // });
  });
});
