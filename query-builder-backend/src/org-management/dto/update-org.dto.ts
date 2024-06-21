import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class Update_Org_Dto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  logo?: string;
}
