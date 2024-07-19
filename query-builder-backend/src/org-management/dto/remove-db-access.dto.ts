import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Remove_Db_Access_Dto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    org_id: string;
}