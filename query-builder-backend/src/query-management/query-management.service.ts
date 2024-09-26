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
import { Share_Query_Dto } from './dto/share-query.dto';

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
      queryTitle: save_query_dto.queryTitle,
      description: save_query_dto.description,
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
      .select('parameters, queryTitle, saved_at, query_id, db_id, description, type')
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

    // Filter out the members who dont have access to the database in the query
    const { data: db_access_data, error: db_access_error } = await this.supabase
      .getClient()
      .from('db_access')
      .select('user_id')
      .eq('db_id', get_shareable_members_dto.db_id)
      .in(
        'user_id',
        members_data.map((member) => member.user_id)
      );

    if (db_access_error) {
      throw db_access_error;
    }

    // Filter out the members who have access to the database
    const shareable_members_data = members_data.filter((member) => {
      return db_access_data.some(
        (db_access) => db_access.user_id === member.user_id
      );
    });

    // unpack the members data such that it is an array of objects with the keys user_id and first_name and last_name
    const updated_members_data = shareable_members_data.map((member) => {
      const profiles: any = member.profiles;
      return {
        user_id: member.user_id,
        full_name: `${profiles.first_name} ${profiles.last_name}`,
        profile_photo: profiles.profile_photo
      };
    });

    return { data: updated_members_data };
  }

  async shareQuery(share_query_dto: Share_Query_Dto) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get the query to be shared
    const { data: query_data, error: query_error } = await this.supabase
      .getClient()
      .from('saved_queries')
      .select('parameters, queryTitle, query_id, db_id, type')
      .eq('query_id', share_query_dto.query_id)
      .single();

    if (query_error) {
      throw query_error;
    }

    // For each shareable member, add the query to the shared_queries table
    for (const shareable_member of share_query_dto.shareable_members) {
      const { data: share_data, error: share_error } = await this.supabase
        .getClient()
        .from('saved_queries')
        .insert({
          parameters: query_data.parameters,
          user_id: shareable_member,
          db_id: query_data.db_id,
          queryTitle: query_data.queryTitle,
          type: "Shared",
          description: share_query_dto.description
        })
        .select();

      if (share_error) {
        throw share_error;
      }
      if (share_data.length === 0) {
        throw new InternalServerErrorException(
           `Query not shared with ${shareable_member}`
        );
      }
    }

    return { message: 'Query shared successfully' };
  }
}
