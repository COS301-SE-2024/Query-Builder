import { Test, TestingModule } from '@nestjs/testing';
import { PostgresConnectionManagerService } from './postgres-connection-manager.service';
import { SessionStoreModule } from '../../session-store/session-store.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MyLoggerModule } from '../../my-logger/my-logger.module';
import { AppService } from '../../app.service';
import { Connect_Dto } from '../dto/connect.dto';

const SELECT = 0;
const UPDATE = 1;
const AUTH_ADMIN = 2;
const AUTH = 3;
const INSERT = 4;
const DELETE = 5;
const STORAGE = 6;

jest.mock('../../supabase/supabase.ts', () => {
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

describe('PostgresConnectionManagerService', () => {
  let service: PostgresConnectionManagerService;

  const { setTestData, setTestError } = require('../../supabase/supabase.ts');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionStoreModule, SupabaseModule, MyLoggerModule],
      providers: [PostgresConnectionManagerService, AppService]
    }).compile();

    service = module.get<PostgresConnectionManagerService>(
      PostgresConnectionManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('connectToDatabase', () => {
  //   it('should connect to the database successfully', async () => {
  //     const connectDto: Connect_Dto = { databaseServerID: 'test-db-id' };
  //     const session = { id: 'test-session-id', host: undefined };

  //     setTestData([{ host: 'test-host' }]);
  //     setTestError([null]);

  //     const result = await service.connectToDatabase(connectDto, session);

  //     expect(result).toEqual({ success: true, connectionID: undefined });
  //   });
  // });
});

// describe('PostgresConnectionManagerService - connectToDatabase', () => {
//   let service: PostgresConnectionManagerService;
//   let mockSupabase: any;
//   let mockSessionStore: any;
//   let mockLogger: any;

//   beforeEach(async () => {
//     mockSupabase = {
//       getClient: jest.fn().mockReturnThis(),
//       auth: {
//         getUser: jest.fn()
//       },
//       from: jest.fn().mockReturnThis(),
//       select: jest.fn().mockReturnThis(),
//       eq: jest.fn().mockReturnThis(),
//       single: jest.fn()
//     };

//     mockSessionStore = {
//       get: jest.fn(),
//       add: jest.fn(),
//       remove: jest.fn()
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       imports: [SessionStoreModule, SupabaseModule, MyLoggerModule],
//       providers: [
//         PostgresConnectionManagerService,
//         { provide: Supabase, useValue: mockSupabase },
//         { provide: SessionStore, useValue: mockSessionStore },
//         AppService
//       ]
//     }).compile();

//     service = module.get<PostgresConnectionManagerService>(
//       PostgresConnectionManagerService
//     );
//   });

//   it('should throw UnauthorizedException if no db_data', async () => {
//     const connectDto: Connect_Dto = { databaseServerID: 'test-db-id' };
//     const session = { id: 'test-session-id', host: undefined };

//     mockSupabase.auth.getUser.mockResolvedValue({ data: {}, error: null });
//     mockSupabase.single.mockResolvedValue({ data: null, error: null });

//     await expect(
//       service.connectToDatabase(connectDto, session)
//     ).rejects.toThrow(UnauthorizedException);
//   });

//   it('should reconnect to an existing session if host matches', async () => {
//     const connectDto: Connect_Dto = { databaseServerID: 'test-db-id' };
//     const session = { id: 'test-session-id', host: 'test-host' };

//     mockSupabase.auth.getUser.mockResolvedValue({ data: {}, error: null });
//     mockSupabase.single.mockResolvedValue({
//       data: { host: 'test-host' },
//       error: null
//     });
//     mockSessionStore.get.mockReturnValue({
//       conn: { threadID: 'test-thread-id' }
//     });

//     const result = await service.connectToDatabase(connectDto, session);

//     expect(result).toEqual({ success: true, connectionID: 'test-thread-id' });
//     expect(mockLogger.log).toHaveBeenCalledWith(
//       `[Reconnecting] ${session.id} connected to test-host`,
//       PostgresConnectionManagerService.name
//     );
//   });

//   it('should handle errors during connection', async () => {
//     const connectDto: Connect_Dto = { databaseServerID: 'test-db-id' };
//     const session = { id: 'test-session-id', host: undefined };

//     mockSupabase.auth.getUser.mockResolvedValue({ data: {}, error: null });
//     mockSupabase.single.mockResolvedValue({
//       data: { host: 'test-host' },
//       error: null
//     });
//     jest
//       .spyOn(service, 'decryptDbSecrets')
//       .mockResolvedValue({ user: 'test-user', password: 'test-password' });

//     const mockClient = {
//       connect: jest.fn().mockRejectedValue(new Error('Connection error'))
//     };
//     jest
//       .spyOn(Client.prototype, 'connect')
//       .mockImplementation(mockClient.connect);

//     await expect(
//       service.connectToDatabase(connectDto, session)
//     ).rejects.toThrow('Connection error');
//   });
// });
