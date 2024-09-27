import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class Saved_DB_Metadata_Dto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  db_id: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  org_id?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class Saved_Table_Metadata_Dto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  db_id: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  org_id?: string;

  @IsString()
  @IsNotEmpty()
  table_name: string[];

  @IsString()
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
