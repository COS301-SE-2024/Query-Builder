import { Body, Controller, Put, Session } from '@nestjs/common';
import { DbMetadataHandlerService } from './db-metadata-handler.service';

interface SchemaQuery {
    databaseServerID: string
}

interface TableQuery {
    databaseServerID: string,
    schema: string;
}

interface FieldQuery {
    databaseServerID: string,
    schema: string;
    table: string;
}

interface ForeignKeyQuery {
    databaseServerID: string,
    schema: string;
    table: string;
}

@Controller('metadata')
export class DbMetadataHandlerController {

    constructor(private readonly dbMetadataHandlerService: DbMetadataHandlerService) {}

    @Put("schemas")
    async getSchemaMetadata(@Body() schemaQuery: SchemaQuery, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getSchemaMetadata(schemaQuery, session);
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
    async getForeignKeyMetadata(@Body() foreignKeyQuery: ForeignKeyQuery, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getForeignKeyMetadata(foreignKeyQuery, session);
    }

    @Put("summary")
    async getSchemaSummary(@Body() schemaQuery: SchemaQuery, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getSchemaSummary(schemaQuery, session);
    }
}