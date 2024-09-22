import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { Supabase } from '../supabase/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

jest.mock('../supabase/supabase.ts', () => ({
  Supabase: jest.fn().mockImplementation(() => ({
    getClient: jest.fn(),
    getJwt: jest.fn()
  }))
}));

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
  let supabase: Supabase;

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
    supabase = module.get<Supabase>(Supabase);
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
      const testError = { message: 'Internal Server Exception', status: 500 };

      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: [],
        error: testError
      } as unknown as SupabaseClient);

      await service
        .hasActiveConnection({ databaseServerID: 'db_id' }, { host: 'host' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error).toEqual(testError);
        });
    });

    it('should throw an error when the database does not exist', async () => {
      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: []
      } as unknown as SupabaseClient);

      await service
        .hasActiveConnection({ databaseServerID: 'db_id' }, { host: 'host' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual(
            'You do not have access to this database'
          );
        });
    });

    it('should throw an error when the user does not have access to the database', async () => {
      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis()
      } as unknown as SupabaseClient);

      await service
        .hasActiveConnection({ databaseServerID: 'db_id' }, { host: 'host2' })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual(
            'You do not have access to this database'
          );
        });
    })

    it('should return true when the user has an active connection to the database server', async () => {
      const testData = { host: 'host', port: 'port' };

      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: testData
      } as unknown as SupabaseClient);

      const result = await service.hasActiveConnection(
        { databaseServerID: 'db_id' },
        { host: 'host', port: 'port' }
      );

      expect(result).toEqual({ hasActiveConnection: true });
    });

    it('should return false when the user does not have an active connection to the database server', async () => {
      const testData = { host: 'host', port: 'port' };

      jest.spyOn(supabase, 'getClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: testData
      } as unknown as SupabaseClient);

      const result = await service.hasActiveConnection(
        { databaseServerID: 'db_id' },
        { host: 'host', port: 'port2' }
      );

      expect(result).toEqual({ hasActiveConnection: false });
    });
  });

  describe('decryptDbSecrets', () => {
    it('should rethrow the error generated by the Supabase client when the user is not logged in', async () => {
      const testError = { message: 'User not logged in', status: 401 };

      jest.spyOn(supabase, 'getClient').mockReturnValue({
        auth: {
          getUser: jest.fn().mockReturnValue({ error: testError })
        }
      } as unknown as SupabaseClient);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toEqual(testError);
        });
    });

    it('should rethrow the error generated by the Supabase client when there is an error querying the db_access table', async () => {
      const testData = { user: { id: 'user_id' } };
      const testError = { message: 'Database not found', status: 404 };

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockReturnValue({ data: testData })
        }
      } as unknown as SupabaseClient);

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: testError
      } as unknown as SupabaseClient);

      await service
        .decryptDbSecrets('db_id', { host: 'host' })
        .catch((error) => {
          expect(error).toEqual(testError);
        });
    });

    it('should rethrow the error generated by the Supabase client when the database secret is not found', async () => {
      const testData_1 = { user: { id: 'user_id' } };
      const testData_2 = [];

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockReturnValue({ data: testData_1 })
        }
      } as unknown as SupabaseClient);

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: testData_2
      } as unknown as SupabaseClient);

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
      const testData_1 = { user: { id: 'user_id' } };
      const testData_2 = [{ db_secrets: 'db_secrets' }];

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockReturnValue({ data: testData_1 })
        }
      } as unknown as SupabaseClient);

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: testData_2
      } as unknown as SupabaseClient);

      const result = await service.decryptDbSecrets('db_id', {
        host: 'host',
        sessionKey: 'session'
      });

      expect(result.user).toEqual('test');
      expect(result.password).toEqual('test');
    });

    it("should throw an InternalServerErrorException when the user doesn't have a session", async () => {
      const testData_1 = { user: { id: 'user_id' } };
      const testData_2 = [{ db_secrets: 'db_secrets' }];

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockReturnValue({ data: testData_1 })
        }
      } as unknown as SupabaseClient);

      jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: testData_2
      } as unknown as SupabaseClient);

      await service
        .decryptDbSecrets('db_id', {
          host: 'host'
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.message).toEqual('You do not have a backend session');
        });
    });
  });
});
