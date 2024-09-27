import { Inject, Injectable } from '@nestjs/common';
import { DbMetadataHandlerService } from '../db-metadata-handler.service';
import { Query } from '../../interfaces/dto/query.dto';
import {
  ComparisonOperator,
  compoundCondition,
  LogicalOperator,
  primitiveCondition
} from '../../interfaces/dto/conditions.dto';
import {
  Database_Metadata_Dto,
  Field_Metadata_Dto,
  Foreign_Key_Metadata_Dto,
  Server_Summary_Metadata_Dto,
  Table_Metadata_Dto
} from '../dto/metadata.dto';
import {
  Saved_DB_Metadata_Dto,
  Saved_Table_Metadata_Dto,
  Saved_Field_Metadata_Dto,
  Saved_Foreign_Key_Metadata_Dto
} from '../dto/save-metadata.dto';
import { QueryHandlerService } from '../../query-handler/query-handler.service';
import { Supabase } from '../../supabase/supabase';

@Injectable()
export class MySqlDbMetadataHandlerService extends DbMetadataHandlerService {
  constructor(
    @Inject('QueryHandlerService')
    @Inject('Supabase')
    protected readonly queryHandlerService: QueryHandlerService,
    private readonly supabase: Supabase
  ) {
    super(queryHandlerService);
  }

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
        table: {
          name: 'schemata',
          columns: [{ name: 'schema_name', alias: 'database' }]
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
            { name: 'column_name', alias: 'column_name' },
            {
              name: 'referenced_table_schema',
              alias: 'referenced_table_schema'
            },
            { name: 'referenced_table_name', alias: 'table_name' },
            { name: 'referenced_column_name', alias: 'referenced_column_name' }
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
            { name: 'table_schema', alias: 'table_schema' },
            { name: 'table_name', alias: 'table_name' },
            { name: 'column_name', alias: 'column_name' },
            { name: 'referenced_column_name', alias: 'referenced_column_name' }
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
          columns: [{ name: 'schema_name', alias: 'DATABASE_NAME' }],
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
    }
    else {
      // Check if the database already exists
      const existing_db = existing_data.db_info.databases.find(
        (db) => db.schema_name === save_db_metadata_dto.db_metadata.schema_name
      );

      if (existing_db) {
        // Update the existing database
        this.deepMerge(existing_db, save_db_metadata_dto.db_metadata);
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
  async getSavedDbMetadata(get_db_metadata_dto: Saved_DB_Metadata_Dto) {}

  async saveTableMetadata(save_table_metadata_dto: Saved_Table_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    if (!save_table_metadata_dto.org_id) {
      const { data: org_data, error: org_error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('org_id')
        .eq('db_id', save_table_metadata_dto.databaseServerID)
        .single();

      if (org_error) {
        throw org_error;
      }

      save_table_metadata_dto.org_id = org_data.org_id;
    }

    // Check if the user has permission to save the metadata
    const { data: permission_data, error: permission_error } =
      await this.supabase
        .getClient()
        .from('org_members')
        .select('user_role')
        .eq('org_id', save_table_metadata_dto.org_id)
        .eq('user_id', user_data.user.id)
        .single();

    if (permission_error) {
      throw permission_error;
    }
    if (!permission_data || permission_data.user_role === 'member') {
      throw new Error('User does not have permission to save metadata');
    }

    // Retrieve existing metadata for the specific database schema
    const { data: existing_data, error: existing_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('db_info')
      .eq('db_id', save_table_metadata_dto.databaseServerID)
      .contains('db_info->databases', [{ schema_name: save_table_metadata_dto.schema_name }])
      .single();

    if (existing_error) {
      throw existing_error;
    }

    // Combine the existing metadata with the new metadata
    // data = [{
    //   table_name: 'table1',
    //   description: 'description1'},
    //   {table_name: 'table2',
    //   description: 'description2'}]
    const new_metadata = save_table_metadata_dto.table_name.map(
      (table_name, index) => {
        return {
          table_name: table_name,
          description: save_table_metadata_dto.description[index]
        };
      }
    );

    if (existing_data.db_info) {
      for (const new_table of new_metadata) {
        const existing_table = existing_data.table_meta_data.find(
          (table) => table.table_name === new_table.table_name
        );

        if (existing_table) {
          existing_table.description = new_table.description;
        } else {
          existing_data.table_meta_data.push(new_table);
        }
      }
    } else {
      existing_data.table_meta_data = new_metadata;
    }

    // Save the metadata
    const { data, error } = await this.supabase
      .getClient()
      .from('db_envs')
      .update({
        table_meta_data: existing_data.table_meta_data
      })
      .eq('db_id', save_table_metadata_dto.databaseServerID)
      .select();

    if (error) {
      throw error;
    }

    return { data: data };
  }
  async getSavedTableMetadata(
    get_table_metadata_dto: Saved_Table_Metadata_Dto
  ) {}

  async saveFieldMetadata(save_field_metadata_dto: Saved_Field_Metadata_Dto) {
    // Get the user information
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the org_id from the database
    if (!save_field_metadata_dto.org_id) {
      const { data: org_data, error: org_error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('org_id')
        .eq('db_id', save_field_metadata_dto.databaseServerID)
        .single();

      if (org_error) {
        throw org_error;
      }

      save_field_metadata_dto.org_id = org_data.org_id;
    }

    // Check if the user has permission to save the metadata
    const { data: permission_data, error: permission_error } =
      await this.supabase
        .getClient()
        .from('org_members')
        .select('user_role')
        .eq('org_id', save_field_metadata_dto.org_id)
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
      .select('fields_meta_data')
      .eq('db_id', save_field_metadata_dto.databaseServerID)
      .single();

    if (existing_error) {
      throw existing_error;
    }

    // Combine the existing metadata with the new metadata
    // data = [{
    //   table_name: 'table1',
    //   field_name: ['field1', 'field2'],
    //   description: ['description1', 'description2']},
    //   {table_name: 'table2',
    //   field_name: ['field3', 'field4'],
    //   description: ['description3', 'description4']}]
    const new_metadata = save_field_metadata_dto.field_name.map(
      (field_name, index) => {
        return {
          table_name: save_field_metadata_dto.table_name,
          name: field_name,
          description: save_field_metadata_dto.description[index]
        };
      }
    );

    if (existing_data.fields_meta_data) {
      for (const new_field of new_metadata) {
        const existing_field = existing_data.fields_meta_data.find(
          (field) =>
            field.table_name === new_field.table_name &&
            field.field_name === new_field.name
        );

        if (existing_field) {
          existing_field.description = new_field.description;
        } else {
          existing_data.fields_meta_data.push(new_field);
        }
      }
    } else {
      existing_data.fields_meta_data = new_metadata;
    }

    // Save the metadata
    const { data, error } = await this.supabase
      .getClient()
      .from('db_envs')
      .update({
        fields_meta_data: existing_data.fields_meta_data
      })
      .eq('db_id', save_field_metadata_dto.databaseServerID)
      .select();

    if (error) {
      throw error;
    }

    return { data: data };
  }
  async getSavedFieldMetadata(
    get_field_metadata_dto: Saved_Field_Metadata_Dto
  ) {}

  async saveForeignKeyMetadata(
    save_fk_metadata_dto: Saved_Foreign_Key_Metadata_Dto
  ) {}
  async getSavedForeignKeyMetadata(
    get_fk_metadata_dto: Saved_Foreign_Key_Metadata_Dto
  ) {}

  async saveServerSummaryMetadata() {}
  async getSavedServerSummaryMetadata() {}
}
