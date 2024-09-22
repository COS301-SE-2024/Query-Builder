import { Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { MySqlDbMetadataHandlerService } from "./my-sql-db-metadata-handler/my-sql-db-metadata-handler.service";
import { PostgresDbMetadataHandlerService } from "./postgres-db-metadata-handler/postgres-db-metadata-handler.service";

export class DbMetadataHandlerFactory{

    constructor(
        @Inject(REQUEST) private request: Request,
        private mySqlDbMetadataHandlerService: MySqlDbMetadataHandlerService,
        private postgresDbMetadataHandlerService: PostgresDbMetadataHandlerService
    ){}

    createDbMetadataHandlerService(){

        //get the language from the request
        const language = this.request?.body?.language;

        //create the DbMetadataHandlerService based on the language
        switch(language){
            case 'mysql':
                return this.mySqlDbMetadataHandlerService;
            case 'postgresql':
                return this.postgresDbMetadataHandlerService;
            default:
                throw new Error('Invalid Language');
        }

    }

}