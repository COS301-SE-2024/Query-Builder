import { Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { MySqlQueryHandlerService } from "./my-sql-query-handler/my-sql-query-handler.service";
import { PostgresQueryHandlerService } from "./postgres-query-handler/postgres-query-handler.service";

export class QueryHandlerFactory{

    constructor(
        @Inject(REQUEST) private request: Request,
        private mySqlQueryHandlerService: MySqlQueryHandlerService,
        private postgresQueryHandlerService: PostgresQueryHandlerService,
    ){}

    createQueryHandlerService(){

        //get the language from the request
        const language = this.request?.body?.queryParams.language;

        //create the QueryHandler based on the type
        switch(language){
            case 'mysql':
                return this.mySqlQueryHandlerService;
            case 'postgresql':
                return this.postgresQueryHandlerService;
            default:
                throw new Error('Invalid database type');
        }

    }

}