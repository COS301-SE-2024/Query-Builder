import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class Credentials_Dto {

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
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

    //A database name is optional, and allows a specific database to be connected to with vendors who require a database
    //name for a connection (e.g. Postgres). If it is not supplied for these vendors, then some default database is used.
    //It is ignored by vendors who do not make connections with database names (e.g MySQL)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    databaseName?: string;

}