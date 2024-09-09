import { Body, Controller, Post } from '@nestjs/common';
import { QueryParams } from '../interfaces/dto/query.dto';
import { JsonConverterService } from './json-converter.service';

@Controller('json-converter')
export class JsonConverterController {
  constructor(private readonly jsonConverterService: JsonConverterService) {}

  @Post()
  convert(@Body() queryParams: QueryParams) {
    return this.jsonConverterService.convertJsonToQuery(queryParams);
  }
}
