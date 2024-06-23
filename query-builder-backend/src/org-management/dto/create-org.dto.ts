import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class Create_Org_Dto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  logo?: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;
}
