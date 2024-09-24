import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { Supabase } from '../supabase';
import { Save_Query_Dto } from './dto/save-query.dto';
import { Delete_Query_Dto } from './dto/delete-query.dto';
import { Get_Single_Query_Dto } from './dto/get-single-query.dto';
import { Get_Subqueries_Dto } from './dto/get-subqueries.dto';
import { Get_Shareable_Members_Dto } from './dto/get-shareable-members.dto';
import { NotFoundError } from 'openai';
import { first } from 'rxjs';

@Injectable()
export class QueryManagementService {
  constructor(private readonly supabase: Supabase) {}

  async saveQuery(save_query_dto: Save_Query_Dto) {
    //Firstly get the user who is saving the query
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

        //ensure pageParams and sortParams are stripped from queries being saved
        delete save_query_dto.parameters.pageParams;
        delete save_query_dto.parameters.sortParams;

    //Secondly add the query to the saved_queries table
    const saved_query_fields = {
      parameters: save_query_dto.parameters,
      user_id: user_data.user.id,
      db_id: save_query_dto.db_id,
      queryTitle: save_query_dto.queryTitle
    };

    const { data: save_data, error: save_error } = await this.supabase
      .getClient()
      .from('saved_queries')
      .insert({ ...saved_query_fields })
      .select();

    if (save_error) {
      throw save_error;
    }
    if (save_data.length === 0) {
      throw new InternalServerErrorException('Query not saved');
    }

    return { save_data };
  }

  async getQueries() {
    //Firstly get the user whose queries we are retrieving
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    //Secondly get the queries saved by the user
    const { data: query_data, error: query_error } = await this.supabase
      .getClient()
      .from('saved_queries')
      .select('parameters, queryTitle, saved_at, query_id, db_id')
      .eq('user_id', user_data.user.id);

    if (query_error) {
      throw query_error;
    }

    return { query_data };
  }

  async getSingleQuery(get_single_query_dto: Get_Single_Query_Dto) {
    //Firstly get the user who is saving the query
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    //Secondly get the query saved by the user
    const { data: query_data, error: query_error } = await this.supabase
      .getClient()
      .from('saved_queries')
      .select('parameters, queryTitle, saved_at, query_id, db_id')
      .eq('user_id', user_data.user.id)
      .eq('query_id', get_single_query_dto.query_id)
      .single();
    if (query_error) {
      throw query_error;
    }

        return query_data;
    }

    async getSubqueries(get_subqueries_dto: Get_Subqueries_Dto) {

        //Firstly get the user whose queries we are retrieving
        const { data: user_data, error: user_error } = await this.supabase
            .getClient()
            .auth.getUser(this.supabase.getJwt());

        if (user_error) {
            throw user_error;
        }

        //Secondly get the queries saved by that user, for the requested database server, and for the requested database
        const { data: query_data, error: query_error } = await this.supabase
            .getClient()
            .from('saved_queries')
            .select('query_id, queryTitle, parameters')
            .eq('user_id', user_data.user.id)
            .eq('db_id', get_subqueries_dto.db_id)
            .eq('parameters->>databaseName', get_subqueries_dto.database_name);

        if (query_error) {
            throw query_error;
        }

        return { query_data };

    }

  async deleteQuery(delete_query_dto: Delete_Query_Dto) {
    try {
      // Deleting the query from the saved_queries table
      const { data: delete_data, error: delete_error } = await this.supabase
        .getClient()
        .from('saved_queries')
        .delete()
        .eq('query_id', delete_query_dto.query_id);

      if (delete_error) {
        throw new Error(`Query deletion error: ${delete_error.message}`);
      }

      return { delete_data };
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  }

  async getShareableMembers(
    get_shareable_members_dto: Get_Shareable_Members_Dto
  ) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select('org_id')
      .eq('db_id', get_shareable_members_dto.db_id)
      .single();

    if (org_error) {
      throw org_error;
    }
    if (!org_data) {
      throw new NotFoundException('Organization not found');
    }

    const { data: members_data, error: members_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select('user_id, profiles(*)')
      .eq('org_id', org_data.org_id)
      .neq('user_id', user_data.user.id);

    if (members_error) {
      throw members_error;
    }

    // unpack the members data such that it is an array of objects with the keys user_id and first_name and last_name
    const updated_members_data = members_data.map((member) => {
        const profiles: any = member.profiles;
      return {
        user_id: member.user_id,
        first_name: profiles.first_name,
        last_name: profiles.last_name,
        profile_photo: profiles.profile_photo
      };
    });

    return { data: updated_members_data };
  }
}
