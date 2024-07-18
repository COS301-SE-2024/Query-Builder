import { Controller, Post, Body } from '@nestjs/common';
import { JsonConverterService } from './jsonConverter.service';
import { QueryParams } from '../interfaces/intermediateJSON';

@Controller('convert')
export class JsonConverterController {

    constructor(private readonly jsonConverterService: JsonConverterService){}

    @Post()
    convert(@Body() queryParams: QueryParams){
        return this.jsonConverterService.convertJsonToQuery(queryParams);
    }

}
