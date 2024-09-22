import { IsNotEmpty, IsUUID } from "class-validator";

export class Get_Db_Type_Dto {

    @IsUUID()
    @IsNotEmpty()
    db_id: string;

}