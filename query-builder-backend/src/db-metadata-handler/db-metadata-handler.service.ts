import { Injectable } from '@nestjs/common';
import { QueryHandlerService } from 'src/query-handler/query-handler.service';

interface DatabaseCredentials {
    host: string;
    user: string;
    password: string;
}

interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
}
  
interface PageParams {
    pageNumber: number,
    rowsPerPage: number
}
  
interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    columns: string[],
    condition?: string,
    sortParams?: SortParams,
    pageParams?: PageParams
}
  
interface Query {
    credentials: DatabaseCredentials,
    databaseName: string,
    queryParams: QueryParams
}

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

@Injectable()
export class DbMetadataHandlerService {

    constructor(private readonly queryHandlerService: QueryHandlerService) {}

    async getSchemaMetadata(databaseCredentials: DatabaseCredentials): Promise<any> {

        /*
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name not in ('information_schema', 'mysql', 'sys', 'performance_schema')
        ORDER BY schema_name;
        */
        const query: Query = {
            credentials: databaseCredentials,
            databaseName: "information_schema",
            queryParams: {
                language: "sql",
                query_type: "select",
                table: "schemata",
                columns: ["schema_name"],
                condition:
                    `schema_name NOT IN ('information_schema', 'mysql', 'sys', 'performance_schema')`,
                sortParams: {
                    column: "schema_name",
                },
            },
        };

        const response = await this.queryHandlerService.queryDatabase(query);

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

    async getTableMetadata(tableQuery: TableQuery): Promise<any> {

        /*
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='----------determined by input----------'
        ORDER BY table_name;
        */

        const query: Query = {
            credentials: tableQuery.credentials,
            databaseName: "information_schema",
            queryParams: {
                language: "sql",
                query_type: "select",
                table: "tables",
                columns: ["table_name"],
                condition: `table_schema="${tableQuery.schema}"`,
                sortParams: {
                    column: "table_name",
                },
            },
        };

        const response = await this.queryHandlerService.queryDatabase(query);

        //return in the form the frontend is expecting
        var responseToReturn: Table[] = [];

        for(var table of response.data){

            //COULD THE BELOW BE DONE QUICKER USING JOINS?
            //query the database to get the columns of the table
            const fieldsQuery: Query = {
                credentials: tableQuery.credentials,
                databaseName: "information_schema",
                queryParams: {
                    language: "sql",
                    query_type: "select",
                    table: "columns",
                    columns: ["column_name"],
                    condition:
                        `table_schema = "${tableQuery.schema}" AND table_name="${table.TABLE_NAME}"`,
                    sortParams: {
                        column: "column_name",
                    },
                },
            };
    
            const fieldsResponse = await this.queryHandlerService.queryDatabase(fieldsQuery);
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

    async getFieldMetadata(fieldQuery: FieldQuery) : Promise<any> {

        /*
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '----------determined by input----------' AND table_name='----------determined by input----------'
        ORDER BY column_name;
        ;
        */
        const query: Query = {
            credentials: fieldQuery.credentials,
            databaseName: "information_schema",
            queryParams: {
                language: "sql",
                query_type: "select",
                table: "columns",
                columns: ["column_name"],
                condition:
                    `table_schema = "${fieldQuery.schema}" AND table_name="${fieldQuery.table}"`,
                sortParams: {
                    column: "column_name",
                },
            },
        };

        return await this.queryHandlerService.queryDatabase(query);

    }

}