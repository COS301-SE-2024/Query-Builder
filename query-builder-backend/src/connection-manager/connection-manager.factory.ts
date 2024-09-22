import { Inject, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { Supabase } from '../supabase';
import { MySqlConnectionManagerService } from "./my-sql-connection-manager/my-sql-connection-manager.service";
import { PostgresConnectionManagerService } from "./postgres-connection-manager/postgres-connection-manager.service";
import { MyLoggerService } from "../my-logger/my-logger.service";

export class ConnectionManagerFactory{

    constructor(
        @Inject(REQUEST) private request: Request,
        private mySqlConnectionManagerService: MySqlConnectionManagerService,
        private postgresConnectionManagerService: PostgresConnectionManagerService,
        private readonly supabase: Supabase,
        protected logger: MyLoggerService
    ){
        this.logger.setContext(ConnectionManagerFactory.name);
    }

    async createConnectionManagerService(){

        //get the database server ID from the request
        const databaseServerID = this.request?.body?.databaseServerID;

        //query QBee's database using the database server ID, to determine the type of the database

        //firstly get the user sending the request
        const { data: user_data, error: user_error } = await this.supabase
            .getClient()
            .auth.getUser(this.supabase.getJwt());
        if (user_error) {
            throw user_error;
        }

        //secondly get the database type
        const { data: db_data, error: error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('type')
        .eq('db_id', databaseServerID)
        .single();
        if (error) {
            this.logger.error(error, ConnectionManagerFactory.name);
            throw error;
        }
        if (!db_data) {
            throw new UnauthorizedException('You do not have access to this database');
        }
        const type = db_data.type;

        //create the ConnectionManager based on the type
        switch(type){
            case 'mysql':
                return this.mySqlConnectionManagerService;
            case 'postgresql':
                return this.postgresConnectionManagerService;
            default:
                throw new Error('Invalid database type');
        }

    }

}