import { Test, TestingModule } from '@nestjs/testing';
import { MySqlConnectionManagerService } from './my-sql-connection-manager.service';
import { SessionStoreModule } from '../../session-store/session-store.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MyLoggerModule } from '../../my-logger/my-logger.module';
import { AppService } from '../../app.service';
import { Supabase } from '../../supabase/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

jest.mock('../../supabase/supabase.ts', () => ({
  Supabase: jest.fn().mockImplementation(() => ({
    getClient: jest.fn(),
    getJwt: jest.fn()
  }))
}));

jest.mock('mysql', () => ({
  createConnection: jest.fn().mockReturnValue({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  })
}));

jest.mock('express-session', () => ({
  session: jest.fn((req, res, next) => {
    req.session = {};
    next();
  })
}));

describe('MySqlConnectionManagerService', () => {
  let service: MySqlConnectionManagerService;
  let supabase: Supabase;
  let app_service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionStoreModule, SupabaseModule, MyLoggerModule],
      providers: [MySqlConnectionManagerService, AppService]
    }).compile();

    service = module.get<MySqlConnectionManagerService>(
      MySqlConnectionManagerService
    );
    supabase = module.get<Supabase>(Supabase);
    app_service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('connectToDatabase', () => {
  //   it('should connect to the database successfully', async () => {
  //     jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
  //       auth: {
  //         getUser: jest
  //           .fn()
  //           .mockReturnValue({ data: { user: { user_id: 'id' } } })
  //       }
  //     } as unknown as SupabaseClient);

  //     jest.spyOn(supabase, 'getClient').mockReturnValueOnce({
  //       from: jest.fn().mockReturnValueOnce({
  //         select: jest.fn().mockReturnValueOnce({
  //           eq: jest.fn().mockReturnValueOnce({
  //             single: jest.fn().mockResolvedValueOnce({
  //               data: { host: 'test-host', port: 'test-port' },
  //               error: null
  //             })
  //           })
  //         })
  //       })
  //     } as unknown as SupabaseClient);

  //     jest.spyOn(service, 'decryptDbSecrets').mockResolvedValueOnce({
  //       user: 'test-username',
  //       password: 'test-password'
  //     });

  //     const connection = await service.connectToDatabase(
  //       {
  //         databaseServerID: 'test-server-id',
  //         databaseServerCredentials: {
  //           username: 'test-username',
  //           password: 'test-password'
  //         }
  //       },
  //       { id: 'test-session-id', host: undefined, port: undefined }
  //     );

  //     expect(connection).toBeDefined();
  //     expect(connection.success).toBe(true);
  //     expect(connection.connectionID).toBeDefined();
  //   });
  // });
});

// describe('connectToDatabase', () => {
//   it('should connect to the database successfully', async () => {
//     const connection = await service.connectToDatabase(
//       {
//         databaseServerID: 'test-server-id',
//         databaseServerCredentials: {
//           username: 'test-username',
//           password: 'test-password'
//         }
//       },
//       { id: 'test-session-id', host: undefined, port: undefined }
//     );
//     expect(connection).toBeDefined();
//     expect(connection.success).toBe(true);
//     expect(connection.connectionID).toBeDefined();
//   });

//   it('should throw UnauthorizedException if user does not have access to the database', async () => {
//     jest
//       .spyOn(service['supabase'].getClient().from('db_envs'), 'select')
//       .mockReturnValueOnce({
//         eq: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValueOnce({ data: null, error: null })
//         })
//       } as any);

//     await expect(
//       service.connectToDatabase(
//         {
//           databaseServerID: 'test-server-id',
//           databaseServerCredentials: {
//             username: 'test-username',
//             password: 'test-password'
//           }
//         },
//         { id: 'test-session-id', host: undefined, port: undefined }
//       )
//     ).rejects.toThrow(UnauthorizedException);
//   });

//   it('should reconnect to an existing session if host and port match', async () => {
//     const mockSessionStore = {
//       get: jest.fn().mockReturnValue({ conn: { threadID: 'test-thread-id' } })
//     };
//     service['sessionStore'] = mockSessionStore as any;

//     const connection = await service.connectToDatabase(
//       {
//         databaseServerID: 'test-server-id',
//         databaseServerCredentials: {
//           username: 'test-username',
//           password: 'test-password'
//         }
//       },
//       { id: 'test-session-id', host: 'test-host', port: 'test-port' }
//     );

//     expect(connection).toBeDefined();
//     expect(connection.success).toBe(true);
//     expect(connection.connectionID).toBe('test-thread-id');
//   });

//   it('should disconnect existing session if host and port do not match', async () => {
//     const mockSessionStore = {
//       get: jest.fn().mockReturnValue({ conn: { end: jest.fn() } }),
//       remove: jest.fn()
//     };
//     service['sessionStore'] = mockSessionStore as any;

//     await service.connectToDatabase(
//       {
//         databaseServerID: 'test-server-id',
//         databaseServerCredentials: {
//           username: 'test-username',
//           password: 'test-password'
//         }
//       },
//       { id: 'test-session-id', host: 'old-host', port: 'old-port' }
//     );

//     expect(mockSessionStore.get).toHaveBeenCalledWith('test-session-id');
//     expect(mockSessionStore.get('test-session-id').conn.end).toHaveBeenCalled();
//     expect(mockSessionStore.remove).toHaveBeenCalledWith('test-session-id');
//   });

//   it('should throw BadGatewayException if connection fails', async () => {
//     jest.spyOn(require('mysql'), 'createConnection').mockReturnValueOnce({
//       connect: jest.fn((cb) => cb(new Error('Connection failed')))
//     } as any);

//     await expect(
//       service.connectToDatabase(
//         {
//           databaseServerID: 'test-server-id',
//           databaseServerCredentials: {
//             username: 'test-username',
//             password: 'test-password'
//           }
//         },
//         { id: 'test-session-id', host: undefined, port: undefined }
//       )
//     ).rejects.toThrow(BadGatewayException);
//   });
// });
