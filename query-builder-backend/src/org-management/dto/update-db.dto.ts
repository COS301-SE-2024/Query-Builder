import { IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max } from "class-validator";

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

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(65535)
    port?: number

    @IsOptional()
    @IsNotEmpty()
    db_info?: string;
}