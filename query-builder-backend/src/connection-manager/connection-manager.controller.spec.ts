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

describe('ConnectionManagerController', () => {
  describe('ConnectionManagerController (providing MySqlConnectionManagerService)', () => {
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
            useClass: MySqlConnectionManagerService
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
  });

  describe('ConnectionManagerController (providing PostgresConnectionManagerService)', () => {
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
            useClass: PostgresConnectionManagerService
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
  });
});
