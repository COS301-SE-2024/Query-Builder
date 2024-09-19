import { Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import { Database_Metadata_Dto, Table_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto } from '../dto/metadata.dto';

@Injectable()
export class PostgresDbMetadataHandlerService extends DbMetadataHandlerService {
    
    getDatabaseMetadata(databaseMetadataDto: Database_Metadata_Dto, session: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getTableMetadata(tableMetadataDto: Table_Metadata_Dto, session: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getFieldMetadata(fieldMetadataDto: Field_Metadata_Dto, session: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getForeignKeyMetadata(foreignKeyMetadataDto: Foreign_Key_Metadata_Dto, session: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getServerSummary(serverSummaryMetadataDto: Server_Summary_Metadata_Dto, session: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    
}