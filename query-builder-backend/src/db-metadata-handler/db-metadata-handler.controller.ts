import { Body, Controller, Inject, Put, Session } from '@nestjs/common';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { Database_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto, Table_Metadata_Dto } from './dto/metadata.dto';

@Controller('metadata')
export class DbMetadataHandlerController {

    constructor(@Inject('DbMetadataHandlerService') private readonly dbMetadataHandlerService: DbMetadataHandlerService) {}

    @Put("databases")
    async getSchemaMetadata(@Body() databaseMetadataDto: Database_Metadata_Dto, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getDatabaseMetadata(databaseMetadataDto, session);
    }

    @Put("tables")
    async getTableMetadata(@Body() tableMetadataDto: Table_Metadata_Dto, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getTableMetadata(tableMetadataDto, session);
    }

    @Put("fields")
    async getFieldMetadata(@Body() fieldMetadataDto: Field_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getFieldMetadata(fieldMetadataDto, session);
    }

    @Put("foreign-keys")
    async getForeignKeyMetadata(@Body() foreignKeyMetadataDto: Foreign_Key_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getForeignKeyMetadata(foreignKeyMetadataDto, session);
    }

    @Put("summary")
    async getSchemaSummary(@Body() serverSummaryMetadataDto: Server_Summary_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getServerSummary(serverSummaryMetadataDto, session);
    }
}