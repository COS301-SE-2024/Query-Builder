import { IsNotEmpty, IsUUID } from 'class-validator';

export class Remove_Db_Dto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsUUID()
  @IsNotEmpty()
  db_id: string;
}
