import { Test, TestingModule } from '@nestjs/testing';
import { MySqlConnectionManagerService } from './my-sql-connection-manager.service';
import { SessionStoreModule } from '../../session-store/session-store.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MyLoggerModule } from '../../my-logger/my-logger.module';
import { AppService } from '../../app.service';

// jest.mock('../../supabase/supabase.service', () => ({
//   Supabase: jest.fn().mockImplementation(() => ({
//     getClient: jest.fn().mockReturnValue({
//       auth: {
//         getUser: jest.fn().mockResolvedValue({ data: 'test-user-data' })
//       },
//       from: jest.fn().mockReturnValue({
//         select: jest.fn().mockReturnThis(),
//         eq: jest.fn().mockReturnThis(),

//       })
//     }),
//     getJwt: jest.fn()
//   }))
// }));

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionStoreModule, SupabaseModule, MyLoggerModule],
      providers: [MySqlConnectionManagerService, AppService]
    }).compile();

    service = module.get<MySqlConnectionManagerService>(
      MySqlConnectionManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
  //       { id: 'test-session-id', host: undefined }
  //     );
  //     expect(connection).toBeDefined();
  //   });
  // });
});
