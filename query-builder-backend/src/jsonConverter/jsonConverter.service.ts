import { Injectable } from '@nestjs/common';
import { condition, compoundCondition, primitiveCondition, QueryParams, table, column } from '../interfaces/intermediateJSON';

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
                let groupBy = '';
                let having = '';

                if (jsonData.condition) {
                    where = "WHERE" + this.conditionWhereSQL(jsonData.condition);
                    groupBy = await this.groupBySQL(jsonData);
                    having = await this.havingSQL(jsonData);
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


    conditionWhereSQL(condition: condition)
    {
        if (!condition) 
        {
            return '';
        }
    
        if (this.isCompoundCondition(condition)) 
        {
            const compCondition = condition as compoundCondition;
            let conditionsSQL = '';
    
            for (let i = 0; i < compCondition.conditions.length; i++) {
                const condSQL = this.conditionWhereSQL(compCondition.conditions[i]);
                conditionsSQL += condSQL;
                if (i < compCondition.conditions.length - 1) {
                    conditionsSQL += ` ${compCondition.operator} `;
                }
            }
    
            return `(${conditionsSQL})`;
        } 
        else if (this.isPrimitiveCondition(condition)) 
        {
            const primCondition = condition as primitiveCondition;
            let sql = `${primCondition.column} ${primCondition.operator} `;// name =
    
            if (typeof primCondition.value === 'string') 
            {
                sql += `'${primCondition.value}'`;
            } 
            else if (typeof primCondition.value === 'boolean') 
            {
                sql += primCondition.value ? 'TRUE' : 'FALSE';
            } 
            else // number 
            {
                sql += primCondition.value;
            }// name = 'value'
    
            return sql;
        }
    }

    private isCompoundCondition(condition: any): condition is compoundCondition {
        return (condition as compoundCondition).conditions !== undefined;
    }

    private isPrimitiveCondition(condition: any): condition is primitiveCondition {
        return (condition as primitiveCondition).column !== undefined;
    }

    groupBySQL(jsonData: QueryParams) {
        let groupByColumns = '';
        for (let i = 0; i < jsonData.table.columns.length; i++) {
            const column = jsonData.table.columns[i];
            if(column.aggregation == null)
                {
                    groupByColumns += column.name + ', ';
                }
        }
    
        // Remove the trailing comma and space
        if (groupByColumns) {
            groupByColumns = groupByColumns.slice(0, -2);
            return ` GROUP BY ${groupByColumns}`;
        } else {
            return '';
        }
    }
    
    havingSQL(jsonData: QueryParams)
    {
        if (!jsonData.condition) 
            {
                return '';
            }
    
        const havingConditions = this.getAggregateConditions(jsonData.condition);
    
        return havingConditions.length > 0 ? ` HAVING ${havingConditions.join(' AND ')}` : '';
    }
    
    getAggregateConditions(condition: condition): string[] 
    {
        let aggregateConditions: string[] = [];
    
        if ((condition as compoundCondition).conditions) 
            {
                const compCondition = condition as compoundCondition;
        
                for (let i = 0; i < compCondition.conditions.length; i++) 
                    {
                        aggregateConditions.push(...this.getAggregateConditions(compCondition.conditions[i]));//asked Chat for help make sure this works as intended
                    }
            } 
        else if ((condition as primitiveCondition).aggregate) 
            {
                const primCondition = condition as primitiveCondition;
                let sql = `${primCondition.aggregate}(${primCondition.column}) ${primCondition.operator} `;
        
                if (typeof primCondition.value === 'string') 
                    {
                        sql += `'${primCondition.value}'`;
                    } 
                else if (typeof primCondition.value === 'boolean') 
                    {
                        sql += primCondition.value ? 'TRUE' : 'FALSE';
                    } 
                else 
                    { // number 
                        sql += primCondition.value;
                    }
        
                aggregateConditions.push(sql);
        }
    
        return aggregateConditions;
    }

    //code to be added to mongoDB conversion

    
    
}