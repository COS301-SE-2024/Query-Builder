import { Controller, Post, Body } from '@nestjs/common';
import { JsonConverterService } from 'src/jsonConverter/jsonConverter.service';

interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    column: string,
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
