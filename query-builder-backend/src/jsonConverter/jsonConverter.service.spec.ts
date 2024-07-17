import { Test, TestingModule } from '@nestjs/testing';
import { JsonConverterService } from './jsonConverter.service';
import { QueryParams, AggregateFunction } from '../interfaces/intermediateJSON';

describe('JSONConverterService', () => {
  let service: JsonConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonConverterService],
    }).compile();

    service = module.get<JsonConverterService>(JsonConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to convert primitive conditions', () => {
    
    const condition = {
        column: "name",
        operator: "=",
        value: "value"
    }

    const result = service.conditionWhereSQL(condition);

    expect(result).toEqual("name = 'value'");

});

it('should be able to convert compound conditions', () => {
    
        const condition = {
            conditions: [
                {
                    column: "name",
                    operator: "=",
                    value: "value"
                },
                {
                    column: "age",
                    operator: ">",
                    value: 18
                }
            ],
            operator: "AND"
        }
    
        const result = service.conditionWhereSQL(condition);
    
        expect(result).toEqual("(name = 'value' AND age > 18)");
    
    });

});