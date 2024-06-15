import { Injectable } from '@nestjs/common';

interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
  }

interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    columns: string[],
    condition?: string,
    sortParams?: SortParams
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
                
                //concatenate the column strings together
                const select = jsonData.columns.join(", ");

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
                
                query = `SELECT ${select} FROM ${from}${where}${orderBy}`;
            } else {
                query = 'Unsupported query type';
                return query;
                throw new Error('Unsupported query type');
            }
        } else {
            query = 'Invalid language';
            return query;
            throw new Error('Invalid language');
        }
    
        return query;
    }
}
