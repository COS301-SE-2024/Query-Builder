import { Body, Controller, Inject, Post, ValidationPipe } from '@nestjs/common';
import { QueryParams } from '../interfaces/dto/query.dto';
import { JsonConverterService } from './json-converter.service';

@Controller('json-converter')
export class JsonConverterController {
  constructor(@Inject('JsonConverterService') private readonly jsonConverterService: JsonConverterService) {}

  @Post()
  convert(@Body(ValidationPipe) queryParams: QueryParams) {
    return this.jsonConverterService.convertJsonToQuery(queryParams);
  }
}
