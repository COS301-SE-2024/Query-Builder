import { Test, TestingModule } from '@nestjs/testing';
import { QueryManagementService } from './query-management.service';

describe('QueryManagementService', () => {
  let service: QueryManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryManagementService],
    }).compile();

    service = module.get<QueryManagementService>(QueryManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
