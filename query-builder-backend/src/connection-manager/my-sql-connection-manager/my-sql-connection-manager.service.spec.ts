import { Test, TestingModule } from '@nestjs/testing';
import { MySqlConnectionManagerService } from './my-sql-connection-manager.service';
import { SessionStoreModule } from '../../session-store/session-store.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MyLoggerModule } from '../../my-logger/my-logger.module';
import { AppService } from '../../app.service';

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
});
