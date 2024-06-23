import { IsNotEmpty, IsUUID } from 'class-validator';

export class Remove_Member_Dto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
