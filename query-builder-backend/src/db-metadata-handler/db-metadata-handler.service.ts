import { Inject, Injectable } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { Saved_DB_Metadata_Dto, Saved_Table_Metadata_Dto } from './dto/save-metadata.dto';
import {
  Database_Metadata_Dto,
  Field_Metadata_Dto,
  Foreign_Key_Metadata_Dto,
  Server_Summary_Metadata_Dto,
  Table_Metadata_Dto
} from './dto/metadata.dto';

@Injectable()
export abstract class DbMetadataHandlerService {
  constructor(
    @Inject('QueryHandlerService')
    protected readonly queryHandlerService: QueryHandlerService
  ) {}

  abstract getDatabaseMetadata(
    databaseMetadataDto: Database_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any>;

  abstract getTableMetadata(
    tableMetadataDto: Table_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any>;

  abstract getFieldMetadata(
    fieldMetadataDto: Field_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any>;

  abstract getForeignKeyMetadata(
    foreignKeyMetadataDto: Foreign_Key_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any>;

  //optimised endpoint to get a summary of the entire database server's structure
  abstract getServerSummary(
    serverSummaryMetadataDto: Server_Summary_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any>;

  abstract saveDbMetadata(save_db_metadata_dto: Saved_DB_Metadata_Dto);
  abstract updateDbMetadata(update_db_metadata_dto: Saved_DB_Metadata_Dto);
  abstract deleteDbMetadata(delete_db_metadata_dto: Saved_DB_Metadata_Dto);

  abstract saveTableMetadata(save_table_metadata_dto: Saved_Table_Metadata_Dto);
  abstract updateTableMetadata(update_table_metadata_dto: Saved_Table_Metadata_Dto);
  abstract deleteTableMetadata(delete_table_metadata_dto: Saved_Table_Metadata_Dto);

  abstract saveFieldMetadata();
  abstract updateFieldMetadata();
  abstract deleteFieldMetadata();

  abstract saveForeignKeyMetadata();
  abstract updateForeignKeyMetadata();
  abstract deleteForeignKeyMetadata();

  abstract saveServerSummaryMetadata();
  abstract updateServerSummaryMetadata();
  abstract deleteServerSummaryMetadata();
}
