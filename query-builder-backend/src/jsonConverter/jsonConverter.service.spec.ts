



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

    it('should be able to convert compound conditions with AND and OR', () => {

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
                },
                {
                    conditions: [
                        {
                            column: "city",
                            operator: "=",
                            value: "New York"
                        },
                        {
                            column: "status",
                            operator: "!=",
                            value: "inactive"
                        }
                    ],
                    operator: "OR"
                }
            ],
            operator: "AND"
        }
    
        const result = service.conditionWhereSQL(condition);
    
        expect(result).toEqual("(name = 'value' AND age > 18 AND (city = 'New York' OR status != 'inactive'))");
    
    });
    

    it('should return an empty string if no condition is provided', () => {
    
        const result = service.conditionWhereSQL(null);
    
        expect(result).toEqual("");
    
    });

    
    
    it('should return SQL for a simple aggregate condition', () => {
        const condition = {
            aggregate: "SUM",
            column: "salary",
            operator: ">",
            value: 50000
        };
    
        const result = service.getAggregateConditions(condition);
    
        expect(result).toEqual(["SUM(salary) > 50000"]);
    });

    
    

    it('should return SQL for compound aggregate conditions', () => {
        const condition = {
            conditions: [
                {
                    aggregate: "SUM",
                    column: "salary",
                    operator: ">",
                    value: 50000
                },
                {
                    aggregate: "COUNT",
                    column: "id",
                    operator: ">",
                    value: 10
                }
            ],
            operator: "AND"
        };
    
        const result = service.getAggregateConditions(condition);
    
        expect(result).toEqual(["SUM(salary) > 50000", "COUNT(id) > 10"]);
    });

});