import { Injectable } from '@nestjs/common';

import { compoundCondition, primitiveCondition, QueryParams } from '../interfaces/intermediateJSON';
import { condition } from '../interfaces/intermediateJSON';

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
                let groupBy = '';
                let having = '';

                if (jsonData.condition) {
                    where = "WHERE" + this.conditionWhereSQL(jsonData.condition);
                    groupBy = await this.groupBySQL(jsonData);
                    having = await this.havingSQL(jsonData);
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

    
    
    
}