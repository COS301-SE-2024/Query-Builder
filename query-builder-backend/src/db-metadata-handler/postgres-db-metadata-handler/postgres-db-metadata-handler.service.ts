import { Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import { Database_Metadata_Dto, Table_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto } from '../dto/metadata.dto';
import { Query } from './../../interfaces/dto/query.dto';
import { column } from 'src/interfaces/dto/table.dto';
import { ComparisonOperator, primitiveCondition } from 'src/interfaces/dto/conditions.dto';

@Injectable()
export class PostgresDbMetadataHandlerService extends DbMetadataHandlerService {
    
    async getDatabaseMetadata(databaseMetadataDto: Database_Metadata_Dto, session: Record<string, any>): Promise<any> {

        /*
        SELECT datname FROM pg_database
        */

        const query: Query = {
            databaseServerID: databaseMetadataDto.databaseServerID,
            queryParams: {
                language: "postgresql",
                query_type: "select",
                databaseName: "template1",
                table: {
                    name: "pg_database",
                    columns: [
                        {name: "datname", alias: "database"}
                    ]
                },
                condition: {
                    column: "datistemplate",
                    operator: ComparisonOperator.IS,
                    value: false
                } as primitiveCondition
            }
        }

        return await this.queryHandlerService.queryDatabase(query, session);

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