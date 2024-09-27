import { Body, Controller, Inject, Post, Put, Session, ValidationPipe } from '@nestjs/common';
import { DbMetadataHandlerService } from './db-metadata-handler.service';
import { Database_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto, Table_Metadata_Dto } from './dto/metadata.dto';
import { Saved_DB_Metadata_Dto} from './dto/save-metadata.dto';

@Controller('metadata')
export class DbMetadataHandlerController {

    constructor(@Inject('DbMetadataHandlerService') private readonly dbMetadataHandlerService: DbMetadataHandlerService) {}

    @Put("databases")
    async getSchemaMetadata(@Body(ValidationPipe) databaseMetadataDto: Database_Metadata_Dto, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getDatabaseMetadata(databaseMetadataDto, session);
    }

    @Put("tables")
    async getTableMetadata(@Body(ValidationPipe) tableMetadataDto: Table_Metadata_Dto, @Session() session: Record<string, any>) {
        return this.dbMetadataHandlerService.getTableMetadata(tableMetadataDto, session);
    }

    @Put("fields")
    async getFieldMetadata(@Body(ValidationPipe) fieldMetadataDto: Field_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getFieldMetadata(fieldMetadataDto, session);
    }

    @Put("foreign-keys")
    async getForeignKeyMetadata(@Body(ValidationPipe) foreignKeyMetadataDto: Foreign_Key_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getForeignKeyMetadata(foreignKeyMetadataDto, session);
    }

    @Put("summary")
    async getSchemaSummary(@Body(ValidationPipe) serverSummaryMetadataDto: Server_Summary_Metadata_Dto, @Session() session: Record<string, any>){
        return this.dbMetadataHandlerService.getServerSummary(serverSummaryMetadataDto, session);
    }

    @Post("save-db-metadata")
    async saveDbMetadata(@Body(ValidationPipe) save_db_metadata_dto: Saved_DB_Metadata_Dto){
        return this.dbMetadataHandlerService.saveDbMetadata(save_db_metadata_dto);
    }

    @Put("get-db-metadata")
    async getSavedDbMetadata(@Body(ValidationPipe) get_db_metadata_dto: Database_Metadata_Dto){
        return this.dbMetadataHandlerService.getSavedDbMetadata(get_db_metadata_dto);
    }

    @Put("get-table-metadata")
    async getSavedTableMetadata(@Body(ValidationPipe) get_table_metadata_dto: Table_Metadata_Dto){
        return this.dbMetadataHandlerService.getSavedTableMetadata(get_table_metadata_dto);
    }

    @Put("get-field-metadata")
    async getSavedFieldMetadata(@Body(ValidationPipe) get_field_metadata_dto: Field_Metadata_Dto){
        return this.dbMetadataHandlerService.getSavedFieldMetadata(get_field_metadata_dto);
    }

    @Put('get-foreign-key-metadata')
    async getSavedForeignKeyMetadata(@Body(ValidationPipe) foreignKeyMetadataDto: Foreign_Key_Metadata_Dto){
        return this.dbMetadataHandlerService.getSavedForeignKeyMetadata(foreignKeyMetadataDto);
    }
}