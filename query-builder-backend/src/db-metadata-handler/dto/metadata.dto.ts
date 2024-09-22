import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Database_Metadata_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    language: string

}

export class Table_Metadata_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    database: string

    @IsString()
    @IsNotEmpty()
    language: string

}

export class Field_Metadata_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    database: string

    @IsString()
    @IsNotEmpty()
    table: string

    @IsString()
    @IsNotEmpty()
    language: string

}

export class Foreign_Key_Metadata_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    database: string

    @IsString()
    @IsNotEmpty()
    table: string

    @IsString()
    @IsNotEmpty()
    language: string

}

export class Server_Summary_Metadata_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    language: string

}