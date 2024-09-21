import { Test, TestingModule } from '@nestjs/testing';
import { PostgresDbMetadataHandlerService } from './postgres-db-metadata-handler.service';

describe('PostgresDbMetadataHandlerService', () => {
  let service: PostgresDbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<PostgresDbMetadataHandlerService>(PostgresDbMetadataHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
