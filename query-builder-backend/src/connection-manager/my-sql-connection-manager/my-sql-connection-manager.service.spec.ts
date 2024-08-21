import { Test, TestingModule } from '@nestjs/testing';
import { MySqlConnectionManagerService } from './my-sql-connection-manager.service';

describe('MySqlConnectionManagerService', () => {
  let service: MySqlConnectionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MySqlConnectionManagerService],
    }).compile();

    service = module.get<MySqlConnectionManagerService>(MySqlConnectionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
