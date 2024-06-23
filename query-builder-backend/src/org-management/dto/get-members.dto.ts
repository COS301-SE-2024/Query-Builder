import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class Get_Members_Dto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  user_id?: string;
}
