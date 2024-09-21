import { Test, TestingModule } from '@nestjs/testing';
import { QueryHandlerController } from './query-handler.controller';
import { Query } from './../interfaces/dto/query.dto';

describe('QueryHandlerController', () => {
  let controller: QueryHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryHandlerController],
      providers: [
        {
          provide: 'QueryHandlerService',
          useValue: {
            async queryDatabase(query: Query, session: Record<string, any>){return {}}
          }
        },
      ],
    }).compile();

    controller = module.get<QueryHandlerController>(QueryHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
