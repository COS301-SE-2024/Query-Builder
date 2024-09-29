import { Inject, Injectable, Get } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { Saved_DB_Metadata_Dto } from './dto/save-metadata.dto';
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

  async deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(
          source[key],
          await this.deepMerge(target[key], source[key])
        );
      }
    }

    // Object.assign() does not throw away the original target object,
    // it merges source properties into it, hence creating a deep merge
    Object.assign(target || {}, source);
    return target;
  }

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
  abstract getSavedDbMetadata(get_db_metadata_dto: Database_Metadata_Dto);

  abstract getSavedTableMetadata(get_table_metadata_dto: Table_Metadata_Dto);

  abstract getSavedFieldMetadata(get_field_metadata_dto: Field_Metadata_Dto);

  abstract getSavedForeignKeyMetadata(
    get_fk_metadata_dto: Foreign_Key_Metadata_Dto
  );

  abstract getSavedServerSummaryMetadata(
    get_server_metadata_dto: Server_Summary_Metadata_Dto
  );
}
