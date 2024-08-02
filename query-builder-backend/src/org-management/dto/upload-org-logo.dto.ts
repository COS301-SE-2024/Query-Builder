import { IsNotEmpty, IsString } from "class-validator";

export class Upload_Org_Logo_Dto {
    @IsString()
    @IsNotEmpty()
    org_id: string
}