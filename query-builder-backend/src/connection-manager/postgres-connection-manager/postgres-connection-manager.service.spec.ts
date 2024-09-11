import { Test, TestingModule } from '@nestjs/testing';
import { PostgresConnectionManagerService } from './postgres-connection-manager.service';

describe('PostgresConnectionManagerService', () => {
  let service: PostgresConnectionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresConnectionManagerService]
    }).compile();

    service = module.get<PostgresConnectionManagerService>(
      PostgresConnectionManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
