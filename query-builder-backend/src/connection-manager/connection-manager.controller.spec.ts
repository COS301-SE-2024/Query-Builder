import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerController } from './connection-manager.controller';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';

describe('ConnectionManagerController', () => {
  let controller: ConnectionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SupabaseModule,
        ConfigModule.forRoot({ isGlobal: true }),
        SessionStoreModule
      ],
      controllers: [ConnectionManagerController],
      providers: [ConnectionManagerService, AppService, ConfigService]
    }).compile();

    controller = module.get<ConnectionManagerController>(
      ConnectionManagerController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
