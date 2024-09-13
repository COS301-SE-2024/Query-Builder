import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';
import { MySqlConnectionManagerService } from './my-sql-connection-manager/my-sql-connection-manager.service';
import { PostgresConnectionManagerService } from './postgres-connection-manager/postgres-connection-manager.service';

class MockConnectionManagerService {
  connectToDatabase() {
    return 'mocked connection';
  }
  hasActiveConnection() {
    return 'mocked active connection';
  }
}

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SupabaseModule,
        ConfigModule.forRoot({ isGlobal: true }),
        SessionStoreModule,
        MyLoggerModule
      ],
      controllers: [ConnectionManagerController],
      providers: [
        {
          provide: ConnectionManagerService,
          useClass: MockConnectionManagerService
        },
        AppService,
        ConfigService
      ]
    }).compile();

    controller = module.get<ConnectionManagerController>(
      ConnectionManagerController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('connect', () => {
    it('should return "mocked connection"', async () => {
      expect(await controller.connect(null, null)).toBe('mocked connection');
    });
  });

  describe('hasActiveConnection', () => {
    it('should return "mocked active connection"', async () => {
      expect(await controller.hasActiveConnection(null, null)).toBe(
        'mocked active connection'
      );
    });
  });
});
