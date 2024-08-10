import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class Join_Org_Dto {
  @IsString()
  @IsNotEmpty()
  hash: string;
}
