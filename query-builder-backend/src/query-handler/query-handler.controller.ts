import {Body, Controller, HttpCode, Post} from '@nestjs/common';
import { QueryHandlerService } from './query-handler.service';

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
}

interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
}
  
interface PageParams {
    pageNumber: number,
    rowsPerPage: number
}
  
interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    columns: string[],
    condition?: string,
    sortParams?: SortParams,
    pageParams?: PageParams
}
  
interface Query {
    credentials: DatabaseCredentials,
    databaseName: string,
    queryParams: QueryParams
}

@Controller('query')
export class QueryHandlerController {

    constructor(private readonly queryHandlerService: QueryHandlerService) {}

    //end point to execute a query on a selected database
    @HttpCode(200)
    @Post()
    async query(@Body() query: Query) {
        return this.queryHandlerService.queryDatabase(query);
    }

}