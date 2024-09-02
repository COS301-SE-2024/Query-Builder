import { IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { table } from "./table.dto";

export class join {
  @IsString()
  @IsNotEmpty()
  table1MatchingColumnName: string;

  @ValidateNested()
  table2: table;

  @IsString()
  @IsNotEmpty()
  table2MatchingColumnName: string;
}
