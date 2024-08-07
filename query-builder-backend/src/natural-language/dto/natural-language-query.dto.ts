import { IsNotEmpty, IsUUID } from "class-validator";

export class Natural_Language_Query_Dto {

    @IsNotEmpty()
    databaseServerID: string;

    @IsNotEmpty()
    query: string;

    llm?: string

}