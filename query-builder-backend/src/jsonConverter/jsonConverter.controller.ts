import { Controller, Post, Body } from '@nestjs/common';
import { JsonConverterService } from './jsonConverter.service';

interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    columns: string[],
    condition: string
}

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
