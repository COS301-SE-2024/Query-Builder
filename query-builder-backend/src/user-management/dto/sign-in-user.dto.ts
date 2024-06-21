import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class Sign_In_User_Dto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}