import { Test, TestingModule } from '@nestjs/testing';
import { PostgresQueryHandlerService } from './postgres-query-handler.service';

describe('PostgresQueryHandlerService', () => {
  let service: PostgresQueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresQueryHandlerService],
    }).compile();

    service = module.get<PostgresQueryHandlerService>(PostgresQueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
