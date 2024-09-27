import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import exp from 'constants';

export class Database_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  schema_name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Table_Metadata_Dto)
  tables?: Table_Metadata_Dto[];
}

export class Table_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  table_name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Field_Metadata_Dto)
  fields?: Field_Metadata_Dto[];

  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Foreign_Key_Metadata_Dto)
  @Transform(({ value }) => {
    return value.map((val) => {
      if (val.referenced_table_schema) {
        return new R_Foreign_Key_Metadata_Dto();
      } else {
        return new O_Foreign_Key_Metadata_Dto();
      }
    });
  })
  foreign_keys?: Foreign_Key_Metadata_Dto[];
}

export class Field_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  column_name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}

export class Foreign_Key_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  table_name: string;

  @IsString()
  @IsNotEmpty()
  column_name: string;

  @IsString()
  @IsNotEmpty()
  referenced_column_name: string;
}

export class R_Foreign_Key_Metadata_Dto extends Foreign_Key_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  referenced_table_schema: string;
}

export class O_Foreign_Key_Metadata_Dto extends Foreign_Key_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  table_schema: string;
}

export class Saved_DB_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  databaseServerID: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  org_id?: string;

  @ValidateNested()
  @Type(() => Database_Metadata_Dto)
  db_metadata: Database_Metadata_Dto;
}