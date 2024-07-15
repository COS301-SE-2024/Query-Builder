import { IsEnum, IsJSON, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "src/interfaces/rolesJSON";

export class Update_Member_Dto {
    @IsUUID()
    @IsNotEmpty()
    org_id: string;

    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @IsEnum(["admin", "member"], {
        message: "user_role must be either 'admin' or 'member'"
    })
    @IsNotEmpty()
    user_role: string;

    @IsOptional()
    @IsNotEmpty()
    role_permissions?: {
        is_owner?: boolean;
        add_dbs?: boolean;
        update_dbs?: boolean;
        remove_dbs?: boolean;
        invite_users?: boolean;
        remove_users?: boolean;
        update_user_roles?: boolean;
        view_all_dbs?: boolean;
        view_all_users?: boolean;
        update_db_access?: boolean;
    }
}