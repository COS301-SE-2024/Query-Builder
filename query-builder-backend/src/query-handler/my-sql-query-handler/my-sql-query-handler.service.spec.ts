import { Test, TestingModule } from '@nestjs/testing';
import { MySqlQueryHandlerService } from './my-sql-query-handler.service';

describe('MySqlQueryHandlerService', () => {
  let service: MySqlQueryHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MySqlQueryHandlerService],
    }).compile();

    service = module.get<MySqlQueryHandlerService>(MySqlQueryHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
