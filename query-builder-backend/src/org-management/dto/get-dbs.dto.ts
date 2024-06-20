import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class Get_Dbs_Dto {
    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsOptional()
    @IsUUID()
    @IsNotEmpty()
    db_id?: string;
}