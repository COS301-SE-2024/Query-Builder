import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class Saved_DB_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  databaseServerId: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  org_id?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class Saved_Table_Metadata_Dto {
  @IsString()
  @IsNotEmpty()
  databaseServerId: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  org_id?: string;

  @IsArray()
  @IsNotEmpty()
  table_name: string[];

  @IsArray()
  @IsNotEmpty()
  description: string[];
}

export class Saved_Field_Metadata_Dto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  field_id: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class Saved_Foreign_Key_Metadata_Dto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  foreign_key_id: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
