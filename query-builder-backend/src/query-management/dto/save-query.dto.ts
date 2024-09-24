import { Type } from "class-transformer";
import { IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { QueryParams } from "./../../interfaces/dto/query.dto";

export class Save_Query_Dto {

    @IsUUID()
    @IsNotEmpty()
    db_id: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => QueryParams)
    parameters: QueryParams;

    @IsNotEmpty()
    queryTitle: string;

}