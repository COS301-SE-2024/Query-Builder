import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class Add_Member_Dto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
