import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class Update_Member_Dto {
    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @IsEnum(["admin", "member"])
    @IsNotEmpty()
    user_role: string;
}