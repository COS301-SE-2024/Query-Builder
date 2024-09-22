import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterController } from './json-converter.controller';
import { QueryParams } from '../interfaces/dto/query.dto';

describe('JsonConverterController', () => {
  let controller: JsonConverterController;

  describe('with mysql provider', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [JsonConverterController],
        providers: [
          {
            provide: 'JsonConverterService',
            useValue: {
              convertJsonToQuery(jsonData: QueryParams){return 'mockReturnValue'},
              convertJsonToCountQuery(jsonData: QueryParams){return 'mockReturnValue'}
            }
          }
        ]
      }).compile();

      controller = module.get<JsonConverterController>(JsonConverterController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

  });
});
