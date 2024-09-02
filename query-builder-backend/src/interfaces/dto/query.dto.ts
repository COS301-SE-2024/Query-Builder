import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsNumber,
  Min
} from 'class-validator';
import { condition } from './conditions.dto';
import { table } from './table.dto';
import { Type } from 'class-transformer';

export class DatabaseCredentials {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class QueryParams {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  query_type: string;

  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ValidateNested()
  @Type(() => table)
  table: table;

  @IsOptional()
  @ValidateNested()
  @Type(() => condition)
  condition?: condition;

  @IsOptional()
  @ValidateNested()
  @Type(() => SortParams)
  sortParams?: SortParams;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageParams)
  pageParams?: PageParams;
}

export class Query {
  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseCredentials)
  credentials?: DatabaseCredentials;

  @IsString()
  @IsNotEmpty()
  databaseServerID: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => QueryParams)
  queryParams: QueryParams;
}

export class SortParams {
  @IsString()
  @IsNotEmpty()
  column: string;

  @IsOptional()
  @IsEnum(['ascending', 'descending'], {
    message: 'Must be either ascending or descending'
  })
  direction?: string;
}

export class PageParams {
  //note pageNumbers are indexed from 1
  @IsNumber()
  @Min(1)
  pageNumber: number;

  @IsNumber()
  @Min(1)
  rowsPerPage: number;
}
