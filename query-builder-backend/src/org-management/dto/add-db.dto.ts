import { IsJSON, IsNotEmpty, IsUUID } from "class-validator";

export class Add_Db_Dto {
    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsJSON()
    @IsNotEmpty()
    db_info: {}
}