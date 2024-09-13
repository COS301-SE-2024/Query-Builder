import { Test, TestingModule } from '@nestjs/testing';
import { PostgresConnectionManagerService } from './postgres-connection-manager.service';
import { SessionStoreModule } from '../../session-store/session-store.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MyLoggerModule } from '../../my-logger/my-logger.module';
import { AppService } from '../../app.service';

describe('PostgresConnectionManagerService', () => {
  let service: PostgresConnectionManagerService;

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
});
