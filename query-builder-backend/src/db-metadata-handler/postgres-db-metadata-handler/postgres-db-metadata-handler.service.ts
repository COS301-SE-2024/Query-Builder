import { Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import {
  Database_Metadata_Dto,
  Table_Metadata_Dto,
  Field_Metadata_Dto,
  Foreign_Key_Metadata_Dto,
  Server_Summary_Metadata_Dto
} from '../dto/metadata.dto';
import { Query } from './../../interfaces/dto/query.dto';
import {
  ComparisonOperator,
  compoundCondition,
  LogicalOperator,
  primitiveCondition
} from './../../interfaces/dto/conditions.dto';
import { Saved_DB_Metadata_Dto } from '../dto/save-metadata.dto';
import { Supabase } from '../../supabase/supabase';
import { QueryHandlerService } from '../../query-handler/query-handler.service';

@Injectable()
export class PostgresDbMetadataHandlerService extends DbMetadataHandlerService {
  constructor(
    private readonly supabase: Supabase,
    protected readonly queryHandlerService: QueryHandlerService
  ) {
    super(queryHandlerService);
  }

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

  async saveDbMetadata(save_db_metadata_dto: Saved_DB_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    if (!save_db_metadata_dto.org_id) {
      const { data: org_data, error: org_error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('org_id')
        .eq('db_id', save_db_metadata_dto.databaseServerID)
        .single();

      if (org_error) {
        throw org_error;
      }

      save_db_metadata_dto.org_id = org_data.org_id;
    }

    // Check if the user has permission to save the metadata
    const { data: permission_data, error: permission_error } =
      await this.supabase
        .getClient()
        .from('org_members')
        .select('user_role')
        .eq('org_id', save_db_metadata_dto.org_id)
        .eq('user_id', user_data.user.id)
        .single();

    if (permission_error) {
      throw permission_error;
    }
    if (!permission_data || permission_data.user_role === 'member') {
      throw new Error('User does not have permission to save metadata');
    }

    // Retrieve existing metadata
    const { data: existing_data, error: existing_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', save_db_metadata_dto.databaseServerID)
      .single();

    if (existing_error) {
      throw existing_error;
    }

    // Combine the existing metadata with the new metadata. first check if the db_info is empty
    if (!existing_data.db_info) {
      existing_data.db_info = {
        databases: [
          {
            ...save_db_metadata_dto.db_metadata
          }
        ]
      };
    } else {
      // Check if the database already exists
      const existing_db = existing_data.db_info.databases.find(
        (db) => db.schema_name === save_db_metadata_dto.db_metadata.schema_name
      );

      if (existing_db) {
        // Update the existing database
        if (save_db_metadata_dto.db_metadata.tables) {
          for (const new_table of save_db_metadata_dto.db_metadata.tables) {
            const existing_table = existing_db.tables.find(
              (table) => table.table_name === new_table.table_name
            );

            if (existing_table) {
              // Update the existing table
              existing_table.description = new_table.description;

              if (new_table.fields && existing_table.fields) {
                for (const new_field of new_table.fields) {
                  const existing_field = existing_table.fields.find(
                    (field) => field.column_name === new_field.column_name
                  );

                  if (existing_field) {
                    // Update the existing field
                    existing_field.description = new_field.description;
                  } else {
                    // Add the new field
                    existing_table.fields.push({
                      column_name: new_field.column_name,
                      description: new_field.description
                    });
                  }
                }
              } else {
                // Add the new fields
                existing_table.fields = new_table.fields;
              }
            } else {
              // Add the new table
              existing_db.tables.push({
                ...new_table
              });
            }
          }
        }
      } else {
        // Add the new database
        existing_data.db_info.databases.push({
          ...save_db_metadata_dto.db_metadata
        });
      }
    }

    // Insert the metadata
    const { data, error } = await this.supabase
      .getClient()
      .from('db_envs')
      .update({
        db_info: existing_data.db_info
      })
      .eq('db_id', save_db_metadata_dto.databaseServerID)
      .select();

    if (error) {
      throw error;
    }

    return { data: data };
  }

  async getSavedDbMetadata(get_db_metadata_dto: Database_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('org_id')
      .eq('db_id', get_db_metadata_dto.databaseServerID)
      .single();

    if (org_error) {
      throw org_error;
    }

    // Get the metadata
    const { data: metadata_data, error: metadata_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', get_db_metadata_dto.databaseServerID)
      .single();

    if (metadata_error) {
      throw metadata_error;
    }

    // Process the metadata, such that it only returns the schema_name and the description of each database
    if (!metadata_data.db_info) {
      return { data: [] };
    }

    const processed_data = metadata_data.db_info.databases.map((db) => {
      return {
        database: db.schema_name,
        description: db.description
      };
    });

    return { data: processed_data };
  }

  async getSavedTableMetadata(get_table_metadata_dto: Table_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('org_id')
      .eq('db_id', get_table_metadata_dto.databaseServerID)
      .single();

    if (org_error) {
      throw org_error;
    }

    // Get the metadata
    const { data: metadata_data, error: metadata_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', get_table_metadata_dto.databaseServerID)
      .single();

    if (metadata_error) {
      throw metadata_error;
    }

    // Process the metadata, such that it only returns the table_name and the description of each table for the specified database
    if (!metadata_data.db_info) {
      return { data: [] };
    }

    const database = metadata_data.db_info.databases.find(
      (db) => db.schema_name === get_table_metadata_dto.database
    );

    if (!database || !database.tables) {
      return { data: [] };
    }

    const processed_data = database.tables.map((table) => {
      return {
        table_name: table.table_name,
        description: table.description
      };
    });

    return { data: processed_data };
  }

  async getSavedFieldMetadata(get_field_metadata_dto: Field_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('org_id')
      .eq('db_id', get_field_metadata_dto.databaseServerID)
      .single();

    if (org_error) {
      throw org_error;
    }

    // Get the metadata
    const { data: metadata_data, error: metadata_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', get_field_metadata_dto.databaseServerID)
      .single();

    if (metadata_error) {
      throw metadata_error;
    }

    // Process the metadata, such that it only returns the column_name and the description of each column for the specified database and table
    if (!metadata_data.db_info) {
      return { data: [] };
    }

    const database = metadata_data.db_info.databases.find(
      (db) => db.schema_name === get_field_metadata_dto.database
    );

    if (!database || !database.tables) {
      return { data: [] };
    }

    const table = database.tables.find(
      (table) => table.table_name === get_field_metadata_dto.table
    );

    if (!table || !table.fields) {
      return { data: [] };
    }

    const processed_data = table.fields.map((field) => {
      return {
        name: field.column_name,
        description: field.description
      };
    });

    return { data: processed_data };
  }
  async getSavedForeignKeyMetadata(
    get_fk_metadata_dto: Foreign_Key_Metadata_Dto
  ) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('org_id')
      .eq('db_id', get_fk_metadata_dto.databaseServerID)
      .single();

    if (org_error) {
      throw org_error;
    }

    // Get the metadata
    const { data: metadata_data, error: metadata_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', get_fk_metadata_dto.databaseServerID)
      .single();

    if (metadata_error) {
      throw metadata_error;
    }

    // Process the metadata, such that it only returns foriegn key for the specified database and table
    if (!metadata_data.db_info) {
      return { data: [] };
    }

    const database = metadata_data.db_info.databases.find(
      (db) => db.schema_name === get_fk_metadata_dto.database
    );

    if (!database || !database.tables) {
      return { data: [] };
    }

    const table = database.tables.find(
      (table) => table.table_name === get_fk_metadata_dto.table
    );

    if (!table || !table.foreign_keys) {
      return { data: [] };
    }

    const processed_data = table.foreign_keys;

    return { data: processed_data };
  }
  async getSavedServerSummaryMetadata(
    get_summary_metadata_dto: Server_Summary_Metadata_Dto
  ) {
    throw new Error('Method not implemented.');
  }
}
