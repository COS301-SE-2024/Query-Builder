import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { condition } from "./conditions.dto";
import { table } from "./table.dto";

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
  table: table;

  @IsOptional()
  @ValidateNested()
  condition?: condition;

  @IsOptional()
  @ValidateNested()
  sortParams?: SortParams;

  @IsOptional()
  @ValidateNested()
  pageParams?: PageParams;
}

export class Query {
  @IsOptional()
  @ValidateNested()
  credentials?: DatabaseCredentials;

  @IsString()
  @IsNotEmpty()
  databaseServerID: string;

  @IsNotEmpty()
  @ValidateNested()
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
