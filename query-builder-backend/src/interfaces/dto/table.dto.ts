import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from "class-validator";
import { AggregateFunction } from "../intermediateJSON";
import { join } from "./join.dto";

export class column {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum({ enum: { AggregateFunction } })
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
  columns: column[];

  @IsOptional()
  @ValidateNested()
  join?: join;
}
