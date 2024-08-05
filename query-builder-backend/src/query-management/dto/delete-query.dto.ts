import { IsNotEmpty, IsUUID } from "class-validator";

export class Delete_Query_Dto {

    @IsUUID()
    @IsNotEmpty()
    query_id: string;

}