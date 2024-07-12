import { Injectable } from '@nestjs/common';

import { QueryParams, table } from '../interfaces/intermediateJSON';

@Injectable()
export class JsonConverterService {

    //helper function to generate string of all the columns to be returned from a table
    generateListOfColumns(table: table){

        let tableColumns = '';

        //if the columns array is empty return all the columns for the table
        if(table.columns.length == 0){
            tableColumns = table.name + '.' + '*';
        }
        //otherwise concatenate the column strings together
        else{
            //first add tick symbols around each column name to deal with names with spaces
            for(let columnIndex = 0; columnIndex < table.columns.length-1; columnIndex++){
                tableColumns += '`' + table.name + '.' + table.columns[columnIndex] + '`,'
            }
            tableColumns += '`' + table.name + '.' + table.columns[table.columns.length-1] + '`';
        }

        return tableColumns;

    }

    generateSelectClause(queryParams: QueryParams): string {

        let selectClause = '';

        //get the columns from each table by traversing the table linked list
        
        //get a reference to the first table
        let tableRef = queryParams.table;

        //concatenate the first table's columns
        selectClause += this.generateListOfColumns(tableRef);

        //traverse the table linked list and add columns for each table until tableRef.join is null
        while(tableRef.join){

            //move the table reference one on
            tableRef = tableRef.join.table2;

            selectClause += ', ' + this.generateListOfColumns(tableRef);

        }
        
        console.log(selectClause);
        return selectClause;

    }

    async convertJsonToQuery(jsonData: QueryParams): Promise<string> {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.table.columns) {
                    query = 'Invalid query';
                    return query;
                }
                
                let select = this.generateSelectClause(jsonData);

                const from = jsonData.table.name;
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