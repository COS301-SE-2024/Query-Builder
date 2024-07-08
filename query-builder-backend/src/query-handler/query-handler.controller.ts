import { BadGatewayException, Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
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
        try {
            const result = await this.queryHandlerService.queryDatabase(query);
            return result;
        } catch (error) {
            if (error.errorCode == "Access Denied") {
                throw new UnauthorizedException(
                    "Please ensure that your database credentials are correct.",
                );
            } else {
                console.log(error);
                throw new BadGatewayException(
                    "Could not connect to the external database - are the host and port correct?",
                );
            }
        }
    }

}