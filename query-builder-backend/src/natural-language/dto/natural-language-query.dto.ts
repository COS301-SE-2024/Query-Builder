import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Natural_Language_Query_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

    @IsString()
    @IsNotEmpty()
    query: string;

    //the language the database server uses - for server summary metadata purposes
    @IsString()
    @IsNotEmpty()
    language: string;

    llm?: string

}