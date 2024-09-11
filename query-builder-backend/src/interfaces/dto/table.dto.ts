import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested
} from 'class-validator';
import { AggregateFunction } from './conditions.dto';
import { join } from './join.dto';
import { Type } from 'class-transformer';

export class column {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(AggregateFunction, {
    message: `Aggregate function must be one of ${Object.values(AggregateFunction).join(', ')}`
  })
  aggregation?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  alias?: string;
}

export class table {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => column)
  columns: column[];

  @IsOptional()
  @ValidateNested()
  @Type(() => join)
  @IsNotEmpty()
  join?: join;
}
