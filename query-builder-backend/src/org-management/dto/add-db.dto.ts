import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPort, IsString, IsUUID, Max, Min } from "class-validator";

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

    @IsInt()
    @Min(0)
    @Max(65535)
    port: number

    @IsOptional()
    @IsNotEmpty()
    db_info?: string;
    
}