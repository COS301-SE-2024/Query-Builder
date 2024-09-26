import { IsNotEmpty, IsUUID } from "class-validator";

export class Get_Shareable_Members_Dto {
    @IsUUID()
    @IsNotEmpty()
    query_id: string;

    @IsUUID()
    @IsNotEmpty()
    db_id: string;
}