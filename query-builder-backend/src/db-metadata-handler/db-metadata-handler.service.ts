import { Inject, Injectable } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { Database_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto, Table_Metadata_Dto } from './dto/metadata.dto';

@Injectable()
export abstract class DbMetadataHandlerService {
  constructor(@Inject('QueryHandlerService') protected readonly queryHandlerService: QueryHandlerService) {}

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

}
