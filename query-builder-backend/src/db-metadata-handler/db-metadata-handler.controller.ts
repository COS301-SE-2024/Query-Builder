import { Body, Controller, Put, Session } from '@nestjs/common';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { DatabaseCredentials } from '../interfaces/intermediateJSON';

interface TableQuery {
    credentials: DatabaseCredentials;
    schema: string;
}

interface FieldQuery {
    credentials: DatabaseCredentials;
    schema: string;
    table: string;
}

interface ForeignKeyQuery {
    credentials: DatabaseCredentials;
    schema: string;
    table: string;
}

@Controller('metadata')
export class DbMetadataHandlerController {

    constructor(private readonly dbMetadataHandlerService: DbMetadataHandlerService) {}

    @Put("schemas")
    async getSchemaMetadata(@Body() credentials: DatabaseCredentials, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getSchemaMetadata(credentials, session);
    }

    @Put("tables")
    async getTableMetadata(@Body() tableQuery: TableQuery, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getTableMetadata(tableQuery, session);
    }

    @Put("fields")
    async getFieldMetadata(@Body() fieldQuery: FieldQuery, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getFieldMetadata(fieldQuery, session);
    }

    @Put("foreign-keys")
    async getForeignKeyMetadata(@Body() foreignKeyQuery: ForeignKeyQuery, session: Record<string, any>){
        return this.dbMetadataHandlerService.getForeignKeyMetadata(foreignKeyQuery, session);
    }

}