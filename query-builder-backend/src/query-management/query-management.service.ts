import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Supabase } from '../supabase';
import { Save_Query_Dto } from './dto/save-query.dto';

@Injectable()
export class QueryManagementService {

    constructor(private readonly supabase: Supabase,) {}

    async saveQuery(save_query_dto: Save_Query_Dto){

        //Firstly get the user who is saving the query
        const { data: user_data, error: user_error } = await this.supabase
        .getClient()
        .auth.getUser(this.supabase.getJwt());

        if(user_error){
            throw user_error;
        }

        //Secondly add the query to the saved_queries table
        const saved_query_fields = {
            parameters: save_query_dto.parameters,
            user_id: user_data.user.id,
            db_id: save_query_dto.db_id,
            queryTitle: save_query_dto.queryTitle
        }

        const { data: save_data, error: save_error } = await this.supabase
            .getClient()
            .from('saved_queries')
            .insert({...saved_query_fields})
            .select();

        if (save_error) {
            throw save_error;
        }
        if (save_data.length === 0) {
            throw new InternalServerErrorException('Query not saved');
        }

        return { save_data };

    }

    async getQueries(){
            
            //Firstly get the user who is saving the query
            const { data: user_data, error: user_error } = await this.supabase
            .getClient()
            .auth.getUser(this.supabase.getJwt());
    
            if(user_error){
                throw user_error;
            }
    
            //Secondly get the queries saved by the user
            const { data: query_data, error: query_error } = await this.supabase
                .getClient()
                .from('saved_queries')
                .select('parameters, queryTitle, saved_at')
                .eq('user_id', user_data.user.id);
    
            if (query_error) {
                throw query_error;
            }
            if (query_data.length === 0) {
                throw new InternalServerErrorException('No queries found');
            }
    
            return { query_data };
    }

}