import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: any): Promise<string> {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.column) {
                    query = 'Invalid query';
                    return query;
                    throw new Error('Invalid query');
                }
                
                const select = jsonData.column;
                const from = jsonData.table;
                let where = '';

                if (jsonData.condition) {
                    where = ` WHERE ${jsonData.condition}`;
                }
                
                query = `SELECT ${select} FROM ${from}${where}`;
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
