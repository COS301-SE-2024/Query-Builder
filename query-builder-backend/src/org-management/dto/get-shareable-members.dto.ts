import { IsNotEmpty, IsUUID } from "class-validator";

export class Get_Shareable_Members_Dto {
    @IsUUID()
    @IsNotEmpty()
    db_id: string;
}