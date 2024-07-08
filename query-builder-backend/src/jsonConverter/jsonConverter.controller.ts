import { Controller, Post, Body } from '@nestjs/common';
import { JsonConverterService } from './jsonConverter.service';
import { QueryParams } from '../interfaces/intermediateJSON';

@Controller('convert')
export class JsonConverterController {

    constructor(private readonly jsonConverterService: JsonConverterService){}

    @Post()
    async convert(@Body() queryParams: QueryParams){
        try{
            const result = await this.jsonConverterService.convertJsonToQuery(queryParams);
            return result;
        }
        catch(error){
            return error;
        }
    }

}
