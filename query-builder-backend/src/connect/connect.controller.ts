import {
    BadGatewayException,
    Body,
    Controller,
    HttpCode,
    Post,
    Put,
    UnauthorizedException,
} from "@nestjs/common";
import { ConnectionManagerService } from "../connection-manager/connection-manager.service";

interface DatabaseCredentials {
    host: string;
    user: string;
    password: string;
}

interface SortParams {
    column: string;
    direction?: "ascending" | "descending";
}

interface PageParams {
    pageNumber: number;
    rowsPerPage: number;
}

interface QueryParams {
    language: string;
    query_type: string;
    table: string;
    columns: string[];
    condition?: string;
    sortParams?: SortParams;
    pageParams?: PageParams;
}

interface Query {
    credentials: DatabaseCredentials;
    databaseName: string;
    queryParams: QueryParams;
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

@Controller()
export class ConnectController {
    constructor(private readonly connectionManager: ConnectionManagerService) {}

    //end point to test connection to the database server
    @HttpCode(200)
    @Post("connect")
    async connect(@Body() credentials: DatabaseCredentials) {
        try {
            const result = await this.connectionManager.connectToDatabase(
                credentials,
            );
            return result;
        } catch (error) {
            if (error.errorCode == "Access Denied") {
                throw new UnauthorizedException(
                    "Please ensure that your database credentials are correct.",
                );
            } else {
                console.log(error);
                throw new BadGatewayException(
                    "Could not connect to the external database - are the host and port correct?",
                );
            }
        }
    }

    //end point to execute a query on a selected database
    @HttpCode(200)
    @Post("query")
    async query(@Body() query: Query) {
        try {
            const result = await this.connectionManager.queryDatabase(query);
            return result;
        } catch (error) {
            if (error.errorCode == "Access Denied") {
                throw new UnauthorizedException(
                    "Please ensure that your database credentials are correct.",
                );
            } else {
                console.log(error);
                throw new BadGatewayException(
                    "Could not connect to the external database - are the host and port correct?",
                );
            }
        }
    }

    @Put("schema")
    async getSchemaMetadata(@Body() credentials: DatabaseCredentials) {
        /*
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name not in ('information_schema', 'mysql', 'sys', 'performance_schema')
        ORDER BY schema_name;
        */
        const query: Query = {
            credentials: credentials,
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
        return await this.connectionManager.queryDatabase(query);
    }

    @Put("table")
    async getTableMetadata(@Body() tableQuery: TableQuery) {
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
                condition: `table_schema=${tableQuery.schema}`,
                sortParams: {
                    column: "table_name",
                },
            },
        };

        return await this.connectionManager.queryDatabase(query);
    }

    @Put("fields")
    async getFieldMetadata(@Body() fieldQuery: FieldQuery) // need schema and tables
    {
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
                    `table_schema = ${fieldQuery.schema} AND table_name=${fieldQuery.table}`,
                sortParams: {
                    column: "column_name",
                },
            },
        };

        return await this.connectionManager.queryDatabase(query);
    }
}
