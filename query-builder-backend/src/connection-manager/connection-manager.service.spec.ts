import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManagerService } from './connection-manager.service';
import { SessionStoreModule } from '../session-store/session-store.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { MyLoggerModule } from '../my-logger/my-logger.module';

describe('ConnectionManagerService', () => {
  let service: ConnectionManagerService;

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
});
