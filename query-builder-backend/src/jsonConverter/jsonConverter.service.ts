import { Injectable } from '@nestjs/common';

import { QueryParams, table, column } from '../interfaces/intermediateJSON';

@Injectable()
export class JsonConverterService {

    //helper function to generate a string of a column
    generateColumnString(column: column, tableName: string) : string {

        let columnString = '';

        if(column.aggregation){
            columnString += column.aggregation + '(';
        }

        columnString += '`' + tableName + '`.`' + column.name + '`';

        if(column.aggregation){
            columnString += ')'
        }

        if(column.alias){
            columnString += ' AS `' + column.alias + '`';
        }

        return columnString;

    }

    //helper function to generate string of all the columns to be returned from a table
    generateListOfColumns(table: table) : string {

        let tableColumns = '';

        //if the columns array is empty return all the columns for the table
        if(table.columns.length == 0){
            tableColumns = '`' + table.name + '`.' + '*';
        }
        //otherwise concatenate the column strings together
        else{
            //first add tick symbols around each column name to deal with names with spaces
            for(let columnIndex = 0; columnIndex < table.columns.length-1; columnIndex++){
                tableColumns += this.generateColumnString(table.columns[columnIndex], table.name) + ', ';
            }
            tableColumns += this.generateColumnString(table.columns[table.columns.length-1], table.name);
        }

        return tableColumns;

    }

    generateSelectClause(queryParams: QueryParams): string {

        let selectClause = '';
        
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
        
        return selectClause;

    }

    generateFromClause(queryParams: QueryParams): string {

        let fromClause = '';

        //get a reference to the first table
        let tableRef = queryParams.table;

        //concatenate the first table
        fromClause += '`' + tableRef.name + '`';

        //traverse the table linked list and add each join until tableRef.join is null
        while(tableRef.join){

            //get the join
            const join = tableRef.join;

            fromClause += ' JOIN `' + join.table2.name + '` ON `' + tableRef.name + '`.`' + join.table1MatchingColumnName + '`=`' + join.table2.name + '`.`' + join.table2MatchingColumnName + '`';

            //move the table reference one on
            tableRef = tableRef.join.table2;

        }

        return fromClause;

    }

    generateOrderByClause(queryParams: QueryParams): string {

        let orderBy = '';

        if (queryParams.sortParams) {

            let sortDirection = '';

            //SQL specific mapping of directions
            if(queryParams.sortParams.direction == "descending"){
                sortDirection = "DESC";
            }
            //defaults to ascending sorting
            else{
                sortDirection = "ASC";
            }

            orderBy = ' ORDER BY `' + queryParams.sortParams.column + '` ' + sortDirection;

        }

        return orderBy;

    }

    generateLimitClause(queryParams: QueryParams): string {

        let limit = '';

        if (queryParams.pageParams) {

            //get the page number and number of rows of data per page that we would like to return
            const rowsPerPage = queryParams.pageParams.rowsPerPage;
            const pageNumber = queryParams.pageParams.pageNumber;

            //calculate the offset into the data where we should start returning data
            //in SQL rows are indexed from 1 and the OFFSET is one less than the first row we want to return
            const offset = (pageNumber-1)*rowsPerPage;

            limit = ` LIMIT ${rowsPerPage} OFFSET ${offset}`;

        }

        return limit;

    }

    convertJsonToQuery(jsonData: QueryParams): string {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.table.name || !jsonData.table.columns) {
                    throw new Error('Invalid query');
                }
                
                const select = this.generateSelectClause(jsonData);

                const from = this.generateFromClause(jsonData);

                let where = '';

                if (jsonData.condition) {
                    where = ` WHERE ${jsonData.condition}`;
                }

                const orderBy = this.generateOrderByClause(jsonData);

                const limit = this.generateLimitClause(jsonData);

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