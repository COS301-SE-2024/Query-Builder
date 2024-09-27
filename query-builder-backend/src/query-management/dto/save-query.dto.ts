import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { QueryParams } from './../../interfaces/dto/query.dto';

export class Save_Query_Dto {
  @IsUUID()
  @IsNotEmpty()
  db_id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => QueryParams)
  parameters: QueryParams;

  @IsString()
  @IsNotEmpty()
  queryTitle: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
