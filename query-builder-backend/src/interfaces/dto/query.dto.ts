import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsNumber,
  Min
} from 'class-validator';
import {
  ComparisonOperator,
  compoundCondition,
  condition,
  LogicalOperator,
  primitiveCondition
} from './conditions.dto';
import { table } from './table.dto';
import { Transform, Type } from 'class-transformer';

export class DatabaseCredentials {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;
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
  @IsNotEmpty()
  table: table;

  @IsOptional()
  @ValidateNested()
  @Type(() => condition, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: primitiveCondition, name: 'p' },
        { value: compoundCondition, name: 'c' }
      ]
    },
    keepDiscriminatorProperty: true
  })
  @Transform(
    ({ value }) => {
      if (
        value.conditions !== undefined ||
        (value.operator !== undefined && value.operator in LogicalOperator)
      ) {
        return Object.assign(new compoundCondition(), value);
      }

      if (
        value.value !== undefined ||
        value.column !== undefined ||
        (value.operator !== undefined && value.operator in ComparisonOperator)
      ) {
        return Object.assign(new primitiveCondition(), value);
      } else {
        return Object.assign(new primitiveCondition(), value);
      }
    },
    { toClassOnly: true }
  )
  condition?: primitiveCondition | compoundCondition;

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
