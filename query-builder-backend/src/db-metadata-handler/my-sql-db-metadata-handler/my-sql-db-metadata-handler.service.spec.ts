import { Test, TestingModule } from '@nestjs/testing';
import { MySqlDbMetadataHandlerService } from './my-sql-db-metadata-handler.service';

describe('MySqlDbMetadataHandlerService', () => {
  let service: MySqlDbMetadataHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySqlDbMetadataHandlerService,
        {
          provide: 'QueryHandlerService',
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<MySqlDbMetadataHandlerService>(MySqlDbMetadataHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
