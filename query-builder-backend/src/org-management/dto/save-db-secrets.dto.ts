import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Save_Db_Secrets_Dto {

    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsString()
    @IsNotEmpty()
    db_secrets: string;

}