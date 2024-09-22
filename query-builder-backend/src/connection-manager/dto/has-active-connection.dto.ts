import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class Has_Active_Connection_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    //A database name is optional, and allows a specific database to be connected to with vendors who require a database
    //name for a connection (e.g. Postgres). If it is not supplied for these vendors, then some default database is used.
    //It is ignored by vendors who do not make connections with database names (e.g MySQL)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    databaseName?: string;

}