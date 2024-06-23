import { IsNotEmpty, IsUUID } from 'class-validator';

export class Remove_Org_Dto {
  @IsUUID()
  @IsNotEmpty()
  db_id: string;

  @IsUUID()
  @IsNotEmpty()
  org_id: string;
}
