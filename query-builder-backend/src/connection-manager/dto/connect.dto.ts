import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class Credentials_Dto {

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    password: string;
}

export class Connect_Dto {

    //A database server ID must always be provided
    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    //Database credentials are optional and the ConnectionManager will use them to connect if provided.
    //Otherwise ConnectionManager will attempt to find and decrypt saved credentials for the database.
    @IsOptional()
    @ValidateNested()
    @Type(() => Credentials_Dto)
    databaseServerCredentials?: Credentials_Dto;

}