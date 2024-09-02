import {
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  IsInstance
} from 'class-validator';
import { IsType } from '../../type-validator';
import { Type } from 'class-transformer';
// import { LogicalOperator, ComparisonOperator, AggregateFunction } from "../intermediateJSON.dto";

export enum AggregateFunction {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT'
}

export enum ComparisonOperator {
  EQUAL = '=',
  LESS_THAN = '<',
  GREATER_THAN = '>',
  LESS_THAN_EQUAL = '<=',
  GREATER_THAN_EQUAL = '>=',
  NOT_EQUAL = '<>',
  LIKE = 'LIKE',
  IS = 'IS',
  IS_NOT = 'IS NOT'
}

export class condition {
  @IsEnum(
    { c: 'c', p: 'p' },
    {
      message: `type must be one of 'c' or 'p'`
    }
  )
  type: 'c' | 'p';

  protected constructor() {

  }
}

export class primitiveCondition extends condition {
  @ValidateIf(({ value }) => value !== null)
  @IsType(['string', 'number', 'boolean'])
  @IsNotEmpty()
  value: string | number | boolean | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tableName?: string;

  @IsString()
  @IsNotEmpty()
  column: string;

  @IsEnum(ComparisonOperator, {
    message: `Comparison operator must be one of ${Object.values(ComparisonOperator).join(', ')}`
  })
  operator: ComparisonOperator;

  @IsOptional()
  @IsEnum(AggregateFunction, {
    message: `Aggregate function must be one of ${Object.values(AggregateFunction).join(', ')}`
  })
  aggregate?: AggregateFunction;

  // constructor
  constructor() {
    super()
    this.type = 'p';
  }
}

export class compoundCondition extends condition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => condition, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: primitiveCondition, name: 'p' },
        { value: compoundCondition, name: 'c' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  conditions: condition[];

  @IsEnum(LogicalOperator, {
    message: `Logical operator must be one of ${Object.values(LogicalOperator).join(', ')}`
  })
  operator: LogicalOperator;

  constructor(){
    super()
    this.type = 'c'
  }
}
