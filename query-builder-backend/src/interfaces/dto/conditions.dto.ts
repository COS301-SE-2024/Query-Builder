import { IsArray, ValidateNested, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsType } from "../../type-validator";
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

export class condition {}

export class compoundCondition extends condition {
  @IsArray()
  @ValidateNested({ each: true })
  conditions: condition[];

  @IsEnum({ enum: { LogicalOperator } })
  operator: string;
}

export class primitiveCondition extends condition {
  @IsType(['string', 'number', 'boolean', null])
  @IsNotEmpty()
  value: string | number | boolean | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tableName?: string;

  @IsString()
  @IsNotEmpty()
  column: string;

  @IsEnum({ enum: { ComparisonOperator } })
  operator: string;

  @IsOptional()
  @IsEnum({ enum: { AggregateFunction } })
  aggregate?: string;
}
