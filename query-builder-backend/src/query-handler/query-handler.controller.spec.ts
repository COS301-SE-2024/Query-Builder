import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerController } from './query-handler.controller';
import { QueryHandlerService } from './query-handler.service';
import { JsonConverterService } from '../jsonConverter/jsonConverter.service';

describe('QueryHandlerController', () => {
  let controller: QueryHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryHandlerController],
      providers: [QueryHandlerService, JsonConverterService]
    }).compile();

    controller = module.get<QueryHandlerController>(QueryHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
