import { Body, Controller, Put } from '@nestjs/common';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { DatabaseCredentials } from 'src/interfaces/intermediateJSON';

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
    async getSchemaMetadata(@Body() credentials: DatabaseCredentials) {
        return this.dbMetadataHandlerService.getSchemaMetadata(credentials);
    }

    @Put("tables")
    async getTableMetadata(@Body() tableQuery: TableQuery) {
        return this.dbMetadataHandlerService.getTableMetadata(tableQuery);
    }

    @Put("fields")
    async getFieldMetadata(@Body() fieldQuery: FieldQuery){
        return this.dbMetadataHandlerService.getFieldMetadata(fieldQuery);
    }

    @Put("foreign-keys")
    async getForeignKeyMetadata(@Body() foreignKeyQuery: ForeignKeyQuery){
        return this.dbMetadataHandlerService.getForeignKeyMetadata(foreignKeyQuery);
    }

}