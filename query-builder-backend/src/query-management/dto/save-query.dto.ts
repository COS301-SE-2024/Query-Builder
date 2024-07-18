import { IsJSON, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Save_Query_Dto {

    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsNotEmpty()
    @IsString()
    @IsJSON()
    parameters: string;

}