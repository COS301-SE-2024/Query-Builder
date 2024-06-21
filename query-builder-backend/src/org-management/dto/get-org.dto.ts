import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class Get_Org_Dto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  org_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;
}
