import { Injectable } from '@nestjs/common';
import { query } from 'express';

@Injectable()
export class JsonConverterService {

    async convertJsonToQuery(jsonData: any): Promise<string> {
        const query = '';
        if(jsonData.language === 'sql'){
            if(jsonData.query_type === 'select')
                {
                    if(jsonData.table === '' || jsonData.column === '')
                    {
                        return 'Invalid query';
                    }
                    const select = jsonData.table;
                    const from = jsonData.column;
                    const where = jsonData.condition;
            
                    const query = `SELECT ${select} FROM ${from} WHERE ${where}`;
                }
        }
        else
        {
            const query = 'Invalid language';
        }

        return query;
    }

}
