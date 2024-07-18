import { Test, TestingModule } from '@nestjs/testing';
import { QueryManagementController } from './query-management.controller';

describe('QueryManagementController', () => {
  let controller: QueryManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryManagementController],
    }).compile();

    controller = module.get<QueryManagementController>(QueryManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
