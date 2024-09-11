import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class Has_Saved_Db_Creds_Dto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  readonly db_id: string;
}
