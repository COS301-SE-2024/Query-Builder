import { IsNotEmpty, IsUUID } from "class-validator";

export class Has_Active_Connection_Dto {

    @IsUUID()
    @IsNotEmpty()
    databaseServerID: string;

}