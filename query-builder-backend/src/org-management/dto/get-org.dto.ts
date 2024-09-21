import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class Get_Org_Dto {
  @ApiProperty({
    description: 'The unique identifier of the organization',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  org_id?: string;

  @ApiProperty({
    description: 'The name of the organization',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'The unique identifier of the owner',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;
}
