import { Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import { Query } from '../../interfaces/dto/query.dto';
import { ComparisonOperator, compoundCondition, LogicalOperator, primitiveCondition } from '../../interfaces/dto/conditions.dto';
import { Database_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto, Table_Metadata_Dto } from '../dto/metadata.dto';

@Injectable()
export class MySqlDbMetadataHandlerService extends DbMetadataHandlerService {

    async getDatabaseMetadata(
        databaseMetadataDto: Database_Metadata_Dto,
        session: Record<string, any>
    ): Promise<any> {
        /*
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name not in ('information_schema', 'mysql', 'sys', 'performance_schema')
            ORDER BY schema_name;
            */
        const query: Query = {
          databaseServerID: databaseMetadataDto.databaseServerID,
          queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: { name: 'schemata', columns: [{ name: 'schema_name' }] },
            condition: {
              operator: LogicalOperator.AND,
              conditions: [
                {
                  column: 'schema_name',
                  operator: ComparisonOperator.NOT_EQUAL,
                  value: 'information_schema'
                },
                {
                  column: 'schema_name',
                  operator: ComparisonOperator.NOT_EQUAL,
                  value: 'mysql'
                },
                {
                  column: 'schema_name',
                  operator: ComparisonOperator.NOT_EQUAL,
                  value: 'sys'
                },
                {
                  column: 'schema_name',
                  operator: ComparisonOperator.NOT_EQUAL,
                  value: 'performance_schema'
                }
              ]
            } as unknown as compoundCondition,
            sortParams: {
              column: 'schema_name'
            }
          }
        };
    
        return await this.queryHandlerService.queryDatabase(query, session);
    }

    async getTableMetadata(
        tableMetadataDto: Table_Metadata_Dto,
        session: Record<string, any>
    ): Promise<any> {
        /*
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='----------determined by input----------'
            ORDER BY table_name;
            */
    
        const query: Query = {
          databaseServerID: tableMetadataDto.databaseServerID,
          queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: {
              name: 'tables',
              columns: [{ name: 'table_name', alias: 'table_name' }]
            },
            condition: {
              column: 'table_schema',
              operator: ComparisonOperator.EQUAL,
              value: tableMetadataDto.database
            } as primitiveCondition,
            sortParams: {
              column: 'table_name'
            }
          }
        };
    
        const response = await this.queryHandlerService.queryDatabase(
          query,
          session
        );
    
        return response.data;
    }

    async getFieldMetadata(
        fieldMetadataDto: Field_Metadata_Dto,
        session: Record<string, any>
    ): Promise<any> {
        /*
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = '----------determined by input----------' AND table_name='----------determined by input----------'
            ORDER BY column_name;
            ;
            */
        const query: Query = {
          databaseServerID: fieldMetadataDto.databaseServerID,
          queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: {
              name: 'columns',
              columns: [{ name: 'column_name', alias: 'name' }]
            },
            condition: {
              operator: LogicalOperator.AND,
              conditions: [
                {
                  column: 'table_schema',
                  operator: ComparisonOperator.EQUAL,
                  value: fieldMetadataDto.database
                },
                {
                  column: 'table_name',
                  operator: ComparisonOperator.EQUAL,
                  value: fieldMetadataDto.table
                }
              ]
            } as unknown as compoundCondition,
            sortParams: {
              column: 'column_name'
            }
          }
        };
    
        return await this.queryHandlerService.queryDatabase(query, session);
    }

    async getForeignKeyMetadata(
        foreignKeyMetadataDto: Foreign_Key_Metadata_Dto,
        session: Record<string, any>
    ): Promise<any> {
        //First get foreign keys 'from' the table pointing 'to' other tables
    
        /*
            SELECT column_name, referenced_table_schema, referenced_table_name, referenced_column_name
            FROM information_schema.key_column_usage
            WHERE constraint_schema = '----------determined by input----------' AND table_name='----------determined by input----------' AND referenced_column_name IS NOT NULL
            ORDER BY referenced_table_name;
            ;
            */
        const fromQuery: Query = {
          databaseServerID: foreignKeyMetadataDto.databaseServerID,
          queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: {
              name: 'key_column_usage',
              columns: [
                { name: 'column_name' },
                { name: 'referenced_table_schema' },
                { name: 'referenced_table_name', alias: 'table_name' },
                { name: 'referenced_column_name' }
              ]
            },
            condition: {
              operator: LogicalOperator.AND,
              conditions: [
                {
                  column: 'constraint_schema',
                  operator: ComparisonOperator.EQUAL,
                  value: foreignKeyMetadataDto.database
                },
                {
                  column: 'table_name',
                  operator: ComparisonOperator.EQUAL,
                  value: foreignKeyMetadataDto.table
                },
                {
                  column: 'referenced_column_name',
                  operator: ComparisonOperator.IS_NOT,
                  value: null
                }
              ]
            } as unknown as compoundCondition,
            sortParams: {
              column: 'referenced_table_name'
            }
          }
        };
    
        const fromResponse = await this.queryHandlerService.queryDatabase(
          fromQuery,
          session
        );
    
        //Secondly get foreign keys 'from' other tables pointing 'to' the table
    
        /*
            SELECT table_schema, table_name, column_name, referenced_column_name
            FROM information_schema.key_column_usage
            WHERE table_schema = '----------determined by input----------' AND referenced_table_name='----------determined by input----------'
            ORDER BY table_name;
            ;
            */
        const toQuery: Query = {
          databaseServerID: foreignKeyMetadataDto.databaseServerID,
          queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: {
              name: 'key_column_usage',
              columns: [
                { name: 'table_schema' },
                { name: 'table_name', alias: 'table_name' },
                { name: 'column_name' },
                { name: 'referenced_column_name' }
              ]
            },
            condition: {
              operator: LogicalOperator.AND,
              conditions: [
                {
                  column: 'table_schema',
                  operator: ComparisonOperator.EQUAL,
                  value: foreignKeyMetadataDto.database
                },
                {
                  column: 'referenced_table_name',
                  operator: ComparisonOperator.EQUAL,
                  value: foreignKeyMetadataDto.table
                }
              ]
            } as unknown as compoundCondition,
            sortParams: {
              column: 'table_name'
            }
          }
        };
    
        const toResponse = await this.queryHandlerService.queryDatabase(
          toQuery,
          session
        );
    
        return fromResponse.data.concat(toResponse.data);
    }

    //optimised endpoint to get a summary of the entire database server's structure
    async getServerSummary(
        serverSummaryMetadataDto: Server_Summary_Metadata_Dto,
        session: Record<string, any>
    ): Promise<any> {
        /*
            SELECT schema_name, table_name, column_name
            FROM information_schema.schemata 
            JOIN information_schema.tables ON schema_name = table_schema
            JOIN information_schema.columns ON table_name = table_name
            WHERE schema_name not in ('information_schema', 'mysql', 'sys', 'performance_schema');
            */

        const summaryQuery: Query = {
        databaseServerID: serverSummaryMetadataDto.databaseServerID,
        queryParams: {
            language: 'mysql',
            query_type: 'select',
            databaseName: 'information_schema',
            table: {
            name: 'schemata',
            columns: [{ name: 'schema_name' }],
            join: {
                table1MatchingColumnName: 'schema_name',
                table2MatchingColumnName: 'table_schema',
                table2: {
                name: 'tables',
                columns: [{ name: 'table_name' }],
                join: {
                    table1MatchingColumnName: 'table_name',
                    table2MatchingColumnName: 'table_name',
                    table2: {
                    name: 'columns',
                    columns: [{ name: 'column_name' }]
                    }
                }
                }
            }
            },
            condition: {
            operator: LogicalOperator.AND,
            conditions: [
                {
                column: 'schema_name',
                operator: ComparisonOperator.NOT_EQUAL,
                value: 'information_schema'
                },
                {
                column: 'schema_name',
                operator: ComparisonOperator.NOT_EQUAL,
                value: 'mysql'
                },
                {
                column: 'schema_name',
                operator: ComparisonOperator.NOT_EQUAL,
                value: 'sys'
                },
                {
                column: 'schema_name',
                operator: ComparisonOperator.NOT_EQUAL,
                value: 'performance_schema'
                }
            ]
            } as unknown as compoundCondition
        }
        };

        return await this.queryHandlerService.queryDatabase(summaryQuery, session);
    }

}