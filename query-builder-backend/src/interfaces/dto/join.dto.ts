import { IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { table } from "./table.dto";
import { Type } from "class-transformer";

export class join {
  @IsString()
  @IsNotEmpty()
  table1MatchingColumnName: string;

  @ValidateNested()
  @Type(() => table)
  table2: table;

  @IsString()
  @IsNotEmpty()
  table2MatchingColumnName: string;
}
