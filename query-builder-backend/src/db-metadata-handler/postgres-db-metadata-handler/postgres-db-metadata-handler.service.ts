import { Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import { Database_Metadata_Dto, Table_Metadata_Dto, Field_Metadata_Dto, Foreign_Key_Metadata_Dto, Server_Summary_Metadata_Dto } from '../dto/metadata.dto';
import { Query } from './../../interfaces/dto/query.dto';
import { ComparisonOperator, compoundCondition, LogicalOperator, primitiveCondition } from './../../interfaces/dto/conditions.dto';
import { Saved_DB_Metadata_Dto, Saved_Table_Metadata_Dto } from '../dto/save-metadata.dto';

@Injectable()
export class PostgresDbMetadataHandlerService extends DbMetadataHandlerService {
  async getDatabaseMetadata(
    databaseMetadataDto: Database_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any> {
    /*
        SELECT datname FROM pg_database
        WHERE datistemplate IS FALSE;
        */

    const query: Query = {
      databaseServerID: databaseMetadataDto.databaseServerID,
      queryParams: {
        language: 'postgresql',
        query_type: 'select',
        databaseName: 'template1',
        table: {
          name: 'pg_database',
          columns: [{ name: 'datname', alias: 'database' }]
        },
        condition: {
          operator: LogicalOperator.AND,
          conditions: [
            {
              column: 'datistemplate',
              operator: ComparisonOperator.EQUAL,
              value: false
            },
            {
              column: 'datname',
              operator: ComparisonOperator.NOT_EQUAL,
              value: 'postgres'
            }
          ]
        } as unknown as compoundCondition
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
        WHERE table_schema='public'
        ORDER BY table_name;
        */

    const query: Query = {
      databaseServerID: tableMetadataDto.databaseServerID,
      queryParams: {
        language: 'postgresql',
        query_type: 'select',
        databaseName: tableMetadataDto.database,
        table: {
          name: 'information_schema"."tables',
          columns: [{ name: 'table_name', alias: 'table_name' }]
        },
        condition: {
          column: 'table_schema',
          operator: ComparisonOperator.EQUAL,
          value: 'public'
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
        WHERE table_schema = 'public' AND table_name='----------determined by input----------'
        ORDER BY column_name;
        */

    const query: Query = {
      databaseServerID: fieldMetadataDto.databaseServerID,
      queryParams: {
        language: 'postgresql',
        query_type: 'select',
        databaseName: fieldMetadataDto.database,
        table: {
          name: 'information_schema"."columns',
          columns: [{ name: 'column_name', alias: 'name' }]
        },
        condition: {
          operator: LogicalOperator.AND,
          conditions: [
            {
              column: 'table_schema',
              operator: ComparisonOperator.EQUAL,
              value: 'public'
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
    //constraint_column_usage has the columns being referenced 'to'
    //referential_constraints has the foreign key constrains themselves
    //key_column_usage has the columns with the constraints themselves ('from')

    //First get foreign keys 'from' the table pointing 'to' other tables

    const fromQuery: Query = {
      databaseServerID: foreignKeyMetadataDto.databaseServerID,
      queryParams: {
        language: 'postgresql',
        query_type: 'select',
        databaseName: foreignKeyMetadataDto.database,
        table: {
          name: 'information_schema"."key_column_usage',
          columns: [{ name: 'column_name', alias: 'column_name' }],
          join: {
            table1MatchingColumnName: 'constraint_name',
            table2MatchingColumnName: 'constraint_name',
            table2: {
              name: 'information_schema"."referential_constraints',
              columns: [],
              join: {
                table1MatchingColumnName: 'constraint_name',
                table2MatchingColumnName: 'constraint_name',
                table2: {
                  name: 'information_schema"."constraint_column_usage',
                  columns: [
                    { name: 'table_schema', alias: 'referenced_table_schema' },
                    { name: 'table_name', alias: 'table_name' },
                    { name: 'column_name', alias: 'referenced_column_name' }
                  ]
                }
              }
            }
          }
        },
        condition: {
          operator: LogicalOperator.AND,
          conditions: [
            {
              tableName: 'constraint_column_usage',
              column: 'constraint_schema',
              operator: ComparisonOperator.EQUAL,
              value: 'public'
            },
            {
              tableName: 'key_column_usage',
              column: 'table_name',
              operator: ComparisonOperator.EQUAL,
              value: foreignKeyMetadataDto.table
            }
          ]
        } as unknown as compoundCondition
      }
    };

    const fromResponse = await this.queryHandlerService.queryDatabase(
      fromQuery,
      session
    );

    //Secondly get foreign keys 'from' other tables pointing 'to' the table

    const toQuery: Query = {
      databaseServerID: foreignKeyMetadataDto.databaseServerID,
      queryParams: {
        language: 'postgresql',
        query_type: 'select',
        databaseName: foreignKeyMetadataDto.database,
        table: {
          name: 'information_schema"."key_column_usage',
          columns: [
            { name: 'table_schema', alias: 'table_schema' },
            { name: 'table_name', alias: 'table_name' },
            { name: 'column_name', alias: 'column_name' }
          ],
          join: {
            table1MatchingColumnName: 'constraint_name',
            table2MatchingColumnName: 'constraint_name',
            table2: {
              name: 'information_schema"."referential_constraints',
              columns: [],
              join: {
                table1MatchingColumnName: 'constraint_name',
                table2MatchingColumnName: 'constraint_name',
                table2: {
                  name: 'information_schema"."constraint_column_usage',
                  columns: [
                    { name: 'column_name', alias: 'referenced_column_name' }
                  ]
                }
              }
            }
          }
        },
        condition: {
          operator: LogicalOperator.AND,
          conditions: [
            {
              tableName: 'constraint_column_usage',
              column: 'constraint_schema',
              operator: ComparisonOperator.EQUAL,
              value: 'public'
            },
            {
              tableName: 'constraint_column_usage',
              column: 'table_name',
              operator: ComparisonOperator.EQUAL,
              value: foreignKeyMetadataDto.table
            }
          ]
        } as unknown as compoundCondition
      }
    };

    const toResponse = await this.queryHandlerService.queryDatabase(
      toQuery,
      session
    );

    return fromResponse.data.concat(toResponse.data);
  }

  async getServerSummary(
    serverSummaryMetadataDto: Server_Summary_Metadata_Dto,
    session: Record<string, any>
  ): Promise<any> {
    //Since postgres does different connections per database, a separate query has to be done per database
    let response = [];

    //First use getDatabaseMetadata to get all of the individual databases
    const databaseMetadata = await this.getDatabaseMetadata(
      serverSummaryMetadataDto,
      session
    );

    //Then, for each database, perform a single query to get the database's tables and their fields
    for (let row of databaseMetadata.data) {
      const query: Query = {
        databaseServerID: serverSummaryMetadataDto.databaseServerID,
        queryParams: {
          language: 'postgresql',
          query_type: 'select',
          databaseName: row.database,
          table: {
            name: 'information_schema"."tables',
            columns: [{ name: 'table_name', alias: 'table_name' }],
            join: {
              table1MatchingColumnName: 'table_name',
              table2MatchingColumnName: 'table_name',
              table2: {
                name: 'information_schema"."columns',
                columns: [{ name: 'column_name' }]
              }
            }
          },
          condition: {
            tableName: 'information_schema"."tables',
            column: 'table_schema',
            operator: ComparisonOperator.EQUAL,
            value: 'public'
          } as primitiveCondition,
          sortParams: {
            column: 'table_name'
          }
        }
      };

      const queryResponse = await this.queryHandlerService.queryDatabase(
        query,
        session
      );

      for (let row2 of queryResponse.data) {
        row2.DATABASE_NAME = row.database;
      }

      response = response.concat(queryResponse.data);
    }

    return response;
  }

  saveDbMetadata(save_db_metadata_dto: Saved_DB_Metadata_Dto) {
    throw new Error('Method not implemented.');
  }
  getSavedDbMetadata() {
    throw new Error('Method not implemented.');
  }
  saveTableMetadata(save_table_metadata_dto: Saved_Table_Metadata_Dto) {
    throw new Error('Method not implemented.');
  }
  getSavedTableMetadata() {
    throw new Error('Method not implemented.');
  }
  saveFieldMetadata() {
    throw new Error('Method not implemented.');
  }
  getSavedFieldMetadata() {
    throw new Error('Method not implemented.');
  }
  saveForeignKeyMetadata() {
    throw new Error('Method not implemented.');
  }
  getSavedForeignKeyMetadata() {
    throw new Error('Method not implemented.');
  }
  saveServerSummaryMetadata() {
    throw new Error('Method not implemented.');
  }
  getSavedServerSummaryMetadata() {
    throw new Error('Method not implemented.');
  }
}