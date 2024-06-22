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
    table: string,
    columns: string[],
    condition?: string,
    sortParams?: SortParams,
    pageParams?: PageParams
}

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: QueryParams): Promise<string> {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.columns) {
                    query = 'Invalid query';
                    return query;
                    throw new Error('Invalid query');
                }
                
                let select = '';

                //if the columns array is empty return all the columns
                if(jsonData.columns.length == 0){
                    select = "*";
                }
                //otherwise concatenate the column strings together
                else{
                    //first add tick symbols around each column name to deal with names with spaces
                    for(let columnIndex = 0; columnIndex < jsonData.columns.length-1; columnIndex++){
                        select += '`' + jsonData.columns[columnIndex] + '`,'
                    }
                    select += '`' + jsonData.columns[jsonData.columns.length-1] + '`';
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