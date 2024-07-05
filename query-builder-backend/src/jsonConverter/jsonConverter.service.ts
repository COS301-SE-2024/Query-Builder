import { Injectable } from '@nestjs/common';

interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
  }

  interface PageParams {
    //note pageNumbers are indexed from 1
    pageNumber: number,
    rowsPerPage: number
}

interface QueryParams {
    language: string,
    query_type: string,
    table: table,
    join?: join[],
    condition?: condition,
    sortParams?: SortParams,
    pageParams?: PageParams
}

interface table {
    name: string,
    columns: column[],
}

interface column {
    name: string,
    aggregation? : AggregateFunction,
    alias?: string,
}

interface join {
    table1: table,
    table1MatchingColumnName: string,
    table2: table,
    table2MatchingColumnName: string,
}

interface condition {
}

interface compoundCondition extends condition{
    conditions: condition[],
    operator: LogicalOperator,
}

interface primitiveCondition extends condition{
    value: string | number | boolean,
    column: string,
    operator: ComparisonOperator,
    aggregate?: AggregateFunction
}

export enum AggregateFunction {
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
}

export enum LogicalOperator {
    "AND",
    "OR",
    "NOT",
}

export enum ComparisonOperator {
    "=",
    "<",
    ">",
    "<=",
    ">=",
    "<>",
    "LIKE",
}

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: QueryParams): Promise<string> {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.table.columns) {
                    query = 'Invalid query';
                    return query;
                    throw new Error('Invalid query');
                }
                
                let select = '';

                //if the columns array is empty return all the columns
                if(jsonData.table.columns.length == 0){
                    select = "*";
                }
                //otherwise concatenate the column strings together
                else{
                    //first add tick symbols around each column name to deal with names with spaces
                    for(let columnIndex = 0; columnIndex < jsonData.table.columns.length-1; columnIndex++){
                        select += '`' + jsonData.table.columns[columnIndex] + '`,'
                    }
                    select += '`' + jsonData.table.columns[jsonData.table.columns.length-1] + '`';
                }

                const from = jsonData.table;
                let where = '';

                if (jsonData.condition) {
                    where = ` WHERE ${jsonData.condition}`;
                }

                let orderBy = '';

                if (jsonData.sortParams) {

                    let sortDirection = '';

                    //SQL specific mapping of directions
                    if(jsonData.sortParams.direction == "descending"){
                        sortDirection = "DESC";
                    }
                    //defaults to ascending sorting
                    else{
                        sortDirection = "ASC";
                    }

                    orderBy = ` ORDER BY ${jsonData.sortParams.column} ${sortDirection}`;

                }

                let limit = '';

                if (jsonData.pageParams) {

                    //get the page number and number of rows of data per page that we would like to return
                    const rowsPerPage = jsonData.pageParams.rowsPerPage;
                    const pageNumber = jsonData.pageParams.pageNumber;

                    //calculate the offset into the data where we should start returning data
                    //in SQL rows are indexed from 1 and the OFFSET is one less than the first row we want to return
                    const offset = (pageNumber-1)*rowsPerPage;

                    limit = ` LIMIT ${rowsPerPage} OFFSET ${offset}`;

                }
                query = `SELECT ${select} FROM ${from}${where}${orderBy}${limit}`;
            } else {
                query = 'Unsupported query type';
                return query;
            }
        } else {
            query = 'Invalid language';
            return query;
        }
    
        return query;
    }
}