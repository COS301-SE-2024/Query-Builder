import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from "class-validator";

export class Update_User_Dto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  user_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  last_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profile_photo?: string;
}
