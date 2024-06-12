import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: any): Promise<{ query: string, error?: string }> {
        let query = '';
        jsonData.language = jsonData.language.toLowerCase();
        jsonData.query_type = jsonData.query_type.toLowerCase();
    
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (!jsonData.table || !jsonData.column) {
                    return { query: '', error: 'Invalid query' };
                }
                
                const select = jsonData.column;
                const from = jsonData.table;
                let where = '';

                if (jsonData.condition) {
                    where = ` WHERE ${jsonData.condition}`;
                }
                
                query = `SELECT ${select} FROM ${from}${where}`;
            } else {
                return { query: '', error: 'Unsupported query type' };
            }
        } else {
            return { query: '', error: 'Invalid language' };
        }
    
        return { query };
    }
}