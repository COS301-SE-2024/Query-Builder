import { Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { MysqlJsonConverterService } from "./mysql-json-converter/mysql-json-converter.service";
import { PostgresJsonConverterService } from "./postgres-json-converter/postgres-json-converter.service";

export class JsonConverterFactory{

    constructor(
        @Inject(REQUEST) private request: Request,
        private mySqlJsonConverterService: MysqlJsonConverterService,
        private psotgresJsonConverterService: PostgresJsonConverterService
    ){}

    createJsonConverterService(){

        //get the language from the request
        let language = '';
        //the language may be in the body itself, or nested inside a queryParams object
        if(this.request?.body?.queryParams){
            language = this.request?.body?.queryParams.language;
        }
        else{
            language = this.request?.body?.language;
        }


        //create the JsonConverterService based on the language
        switch(language){
            case 'mysql':
                return this.mySqlJsonConverterService;
            case 'postgresql':
                return this.psotgresJsonConverterService;
            default:
                throw new Error('Invalid language');
        }

    }

}