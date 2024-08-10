import { IsNotEmpty, IsUUID } from "class-validator";

export class Get_Single_Query_Dto {

    @IsUUID()
    @IsNotEmpty()
    query_id: string;

}