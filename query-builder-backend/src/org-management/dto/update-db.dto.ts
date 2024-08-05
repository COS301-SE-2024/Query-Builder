import { IsUUID, IsNotEmpty, IsString, IsJWT, IsOptional, IsEnum } from "class-validator";

export class Update_Db_Dto {
    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsEnum(['mysql', 'mongodb', 'postgresql'], {
        message: "Database type must be either 'mysql', 'mongodb' or 'postgresql'"
    })
    @IsNotEmpty()
    type?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    host?: string;

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