import { Injectable } from '@nestjs/common';
import { QueryHandlerService } from '../query-handler/query-handler.service';
import { Query, DatabaseCredentials, ComparisonOperator, LogicalOperator, QueryParams } from '../interfaces/intermediateJSON';

interface Database {
    key: string,
    label: string
}

interface Table {
    table: string,
    columns: string[]
}

interface TableQuery {
    credentials: DatabaseCredentials;
    schema: string;
}

interface FieldQuery {
    credentials: DatabaseCredentials;
    schema: string;
    table: string;
}

interface ForeignKeyQuery {
    credentials: DatabaseCredentials;
    schema: string;
    table: string;
}

@Injectable()
export class DbMetadataHandlerService {

    constructor(private readonly queryHandlerService: QueryHandlerService) {}

    async getSchemaMetadata(databaseCredentials: DatabaseCredentials, session: Record<string, any>): Promise<any> {

        /*
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name not in ('information_schema', 'mysql', 'sys', 'performance_schema')
        ORDER BY schema_name;
        */
        const query: Query = {
            credentials: databaseCredentials,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "information_schema",
                table: {name:"schemata", columns: [{name: "schema_name"}]},
                condition: {
                    operator: LogicalOperator.AND,
                    conditions: [
                        {column: "schema_name", operator: ComparisonOperator.NOT_EQUAL, value: "information_schema"},
                        {column: "schema_name", operator: ComparisonOperator.NOT_EQUAL, value: "mysql"},
                        {column: "schema_name", operator: ComparisonOperator.NOT_EQUAL, value: "sys"},
                        {column: "schema_name", operator: ComparisonOperator.NOT_EQUAL, value: "performance_schema"}
                    ]
                },
                sortParams: {
                    column: "schema_name",
                },
            },
        };

        const response = await this.queryHandlerService.queryDatabase(query, session);

        //return in the form the frontend is expecting
        var responseToReturn: Database[] = [];

        for(var database of response.data){
            console.log(database);
            const newDatabase: Database = {
                key: database.SCHEMA_NAME,
                label: database.SCHEMA_NAME
            }
            responseToReturn.push(newDatabase);
        }

        return responseToReturn;

    }

    async getTableMetadata(tableQuery: TableQuery, session: Record<string, any>): Promise<any> {

        /*
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='----------determined by input----------'
        ORDER BY table_name;
        */

        const query: Query = {
            credentials: tableQuery.credentials,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "information_schema", 
                table: {name:"tables", columns: [{name: "table_name"}]},
                condition: {
                    column: "table_schema",
                    operator: ComparisonOperator.EQUAL,
                    value: tableQuery.schema
                },
                sortParams: {
                    column: "table_name",
                },
            },
        };

        const response = await this.queryHandlerService.queryDatabase(query, session);

        //return in the form the frontend is expecting
        var responseToReturn: Table[] = [];

        for(var table of response.data){

            //COULD THE BELOW BE DONE QUICKER USING JOINS?
            //query the database to get the columns of the table
            const fieldsQuery: Query = {
                credentials: tableQuery.credentials,
                queryParams: {
                    language: "sql",
                    query_type: "select",
                    databaseName: "information_schema",
                    table: {name:"columns", columns: [{name: "column_name"}]},
                    condition: {
                        operator: LogicalOperator.AND,
                        conditions: [
                            {column: "table_schema", operator: ComparisonOperator.EQUAL, value: tableQuery.schema},
                            {column: "table_name", operator: ComparisonOperator.EQUAL, value: table.TABLE_NAME}
                        ]
                    },
                    sortParams: {
                        column: "column_name",
                    },
                },
            };
    
            const fieldsResponse = await this.queryHandlerService.queryDatabase(fieldsQuery, session);
            console.log(fieldsResponse);

            var columns: string[] = [];

            for(var column of fieldsResponse.data){
                columns.push(column.COLUMN_NAME)
            }

            const newTable: Table = {
                table: table.TABLE_NAME,
                columns: columns
            }
            responseToReturn.push(newTable);
        }

        return responseToReturn;

    }

    async getFieldMetadata(fieldQuery: FieldQuery, session: Record<string, any>) : Promise<any> {

        /*
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '----------determined by input----------' AND table_name='----------determined by input----------'
        ORDER BY column_name;
        ;
        */
        const query: Query = {
            credentials: fieldQuery.credentials,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "information_schema",
                table: {name:"columns", columns: [{name: "column_name"}]},
                condition: {
                    operator: LogicalOperator.AND,
                    conditions: [
                        {column: "table_schema", operator: ComparisonOperator.EQUAL, value: fieldQuery.schema},
                        {column: "table_name", operator: ComparisonOperator.EQUAL, value: fieldQuery.table}
                    ]
                },
                sortParams: {
                    column: "column_name",
                },
            },
        };

        return await this.queryHandlerService.queryDatabase(query, session);

    }

    async getForeignKeyMetadata(foreignKeyQuery: ForeignKeyQuery, session: Record<string, any>) : Promise<any> {

        //First get foreign keys 'from' the table pointing 'to' other tables

        /*
        SELECT column_name, referenced_table_schema, referenced_table_name, referenced_column_name
        FROM information_schema.key_column_usage
        WHERE constraint_schema = '----------determined by input----------' AND table_name='----------determined by input----------' AND referenced_column_name IS NOT NULL
        ORDER BY referenced_table_name;
        ;
        */
        const fromQuery: Query = {
            credentials: foreignKeyQuery.credentials,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "information_schema",
                table: {name:"key_column_usage", columns: [{name: "column_name"}, {name: "referenced_table_schema"}, {name: "referenced_table_name", alias: "table_name"}, {name: "referenced_column_name"}]},
                condition: {
                    operator: LogicalOperator.AND,
                    conditions: [
                        {column: "constraint_schema", operator: ComparisonOperator.EQUAL, value: foreignKeyQuery.schema},
                        {column: "table_name", operator: ComparisonOperator.EQUAL, value: foreignKeyQuery.table},
                        {column: "referenced_column_name", operator: ComparisonOperator.IS_NOT, value: null}
                    ]
                },
                sortParams: {
                    column: "referenced_table_name",
                },
            },
        };

        const fromResponse = await this.queryHandlerService.queryDatabase(fromQuery, session);

        //Secondly get foreign keys 'from' other tables pointing 'to' the table

        /*
        SELECT table_schema, table_name, column_name, referenced_column_name
        FROM information_schema.key_column_usage
        WHERE table_schema = '----------determined by input----------' AND referenced_table_name='----------determined by input----------'
        ORDER BY table_name;
        ;
        */
        const toQuery: Query = {
            credentials: foreignKeyQuery.credentials,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "information_schema",
                table: {name:"key_column_usage", columns: [{name: "table_schema"}, {name: "table_name", alias: "table_name"}, {name: "column_name"}, {name: "referenced_column_name"}]},
                condition: {
                    operator: LogicalOperator.AND,
                    conditions: [
                        {column: "table_schema", operator: ComparisonOperator.EQUAL, value: foreignKeyQuery.schema},
                        {column: "referenced_table_name", operator: ComparisonOperator.EQUAL, value: foreignKeyQuery.table}
                    ]
                },
                sortParams: {
                    column: "table_name",
                },
            },
        };

        const toResponse = await this.queryHandlerService.queryDatabase(toQuery, session);

        return fromResponse.data.concat(toResponse.data);

    }

}