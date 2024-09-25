import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Get_Subqueries_Dto {

    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsString()
    @IsNotEmpty()
    database_name: string;

}