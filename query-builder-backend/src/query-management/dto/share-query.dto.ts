import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class Share_Query_Dto {
    @IsUUID()
    @IsNotEmpty()
    query_id: string;

    @IsArray()
    @IsNotEmpty()
    shareable_members: string[];
}