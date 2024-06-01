import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: any): Promise<string> {
        let query = '';
        if (jsonData.language === 'sql') {
            if (jsonData.query_type === 'select') {
                if (jsonData.table === '' || jsonData.column === '') {
                    return 'Invalid query';
                }
                const select = jsonData.column;
                const from = jsonData.table;
                const where = jsonData.condition;
        
                query = `SELECT ${select} FROM ${from} WHERE ${where}`;
            } else {
                query = 'Unsupported query type';
            }
        } else {
            throw new Error('Invalid language');
        }

        return query;
    }
}
