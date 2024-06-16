import { Controller, Post, Body, UnauthorizedException, HttpCode, BadGatewayException } from '@nestjs/common';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';

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

@Controller()
export class ConnectController {

    constructor(private readonly connectionManager: ConnectionManagerService){}

    //end point to test connection to the database server
    @HttpCode(200)
    @Post('connect')
    async connect(@Body() credentials: DatabaseCredentials){

        try{
            const result = await this.connectionManager.connectToDatabase(credentials);
            return result;
        }
        catch(error){
            if(error.errorCode == "Access Denied"){
                throw new UnauthorizedException("Please ensure that your database credentials are correct.");
            }
            else{
                console.log(error)
                throw new BadGatewayException("Could not connect to the external database - are the host and port correct?");
            }
        }
    }

    //end point to execute a query on a selected database
    @HttpCode(200)
    @Post('query')
    async query(@Body() query: Query){

        try{
            const result = await this.connectionManager.queryDatabase(query);
            return result;
        }
        catch(error){
            if(error.errorCode == "Access Denied"){
                throw new UnauthorizedException("Please ensure that your database credentials are correct.");
            }
            else{
                console.log(error)
                throw new BadGatewayException("Could not connect to the external database - are the host and port correct?");
            }
        }
    }

}
