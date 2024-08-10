import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class Create_Hash_Dto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    org_id: string
}