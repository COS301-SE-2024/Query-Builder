import { IsEnum, IsJWT, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class Add_Db_Dto {
    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(['mysql', 'mongodb', 'postgresql'], {
        message: "Database type must be either 'mysql', 'mongodb' or 'postgresql'"
    })
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    host: string;

    @IsString()
    @IsNotEmpty()
    session_key: string;

    @IsOptional()
    @IsNotEmpty()
    db_info?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    db_secrets?: string;
}