import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerController } from './query-handler.controller';

describe('QueryHandlerController', () => {
  let controller: QueryHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryHandlerController],
    }).compile();

    controller = module.get<QueryHandlerController>(QueryHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
