import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { createCipheriv, randomBytes } from 'crypto';
import { Supabase } from '../supabase';
import { Get_Org_Dto } from './dto/get-org.dto';
import { Create_Org_Dto } from './dto/create-org.dto';
import { Add_Member_Dto } from './dto/add-member.dto';
import { Add_Db_Dto } from './dto/add-db.dto';
import { Update_Org_Dto } from './dto/update-org.dto';
import { Update_Member_Dto } from './dto/update-member.dto';
import { Update_Db_Dto } from './dto/update-db.dto';
import { Remove_Db_Dto } from './dto/remove-db.dto';
import { Remove_Member_Dto } from './dto/remove-member.dto';
import { Remove_Org_Dto } from './dto/remove-org.dto';
import { ConfigService } from '@nestjs/config';
import { Get_Members_Dto } from './dto/get-members.dto';
import { Get_Dbs_Dto } from './dto/get-dbs.dto';
import { AppService } from '../app.service';

@Injectable()
export class OrgManagementService {
  constructor(
    private readonly supabase: Supabase,
    private readonly configService: ConfigService,
    private readonly app_service: AppService,
  ) {}

  // TODO: Test this function
  async getOrg(org: Get_Org_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('organisations')
      .select(`org_id, created_at, name, logo, org_members(*)`)
      .match({ ...org });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('Organisation not found');
    }

    return { data };
  }

  // TODO: Test this function
  async getOrgLoggedIn() {
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (error) {
      throw error;
    }

    const user_id = data.user.id;

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select('org_id, created_at, name, logo, org_members(*), db_envs(*)')
      .eq('owner_id', user_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new NotFoundException('Organisation not found');
    }

    return { org_data };
  }

  // TODO: Test this function
  async getMembers(get_members_dto: Get_Members_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', get_members_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .select('org_id, user_role, profiles(*)')
      .match({ ...get_members_dto });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('Members not found');
    }

    return { data };
  }

  // TODO: Test this function
  async getDbs(get_dbs_dto: Get_Dbs_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', get_dbs_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_dbs')
      .select('org_id, db_id, db_envs(created_at, name, type)')
      .match({ ...get_dbs_dto });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('Databases not found');
    }

    return { data };
  }

  // TODO: Test this function
  async createOrg(create_org_dto: Create_Org_Dto) {
    if (create_org_dto.owner_id === undefined) {
      const { data: org_owner, error: org_owner_error } = await this.supabase
        .getClient()
        .auth.getUser(this.supabase.getJwt());

      if (org_owner_error) {
        throw org_owner_error;
      }

      let owner_id = org_owner.user.id;
      create_org_dto.owner_id = owner_id;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('organisations')
      .insert({ ...create_org_dto })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Organisation not created');
    }

    const { data: org_member_data, error: org_member_error } =
      await this.supabase
        .getClient()
        .from('org_members')
        .insert({
          org_id: data[0].org_id,
          user_id: create_org_dto.owner_id,
          user_role: 'owner',
        })
        .select();

    if (org_member_error) {
      throw org_member_error;
    }
    if (org_member_data.length === 0) {
      await this.supabase
        .getClient()
        .from('organisations')
        .delete()
        .eq('org_id', data[0].org_id);
      throw new InternalServerErrorException('Owner not added to organisation');
    }

    return { data };
  }

  // TODO: Test this function
  async addMember(add_member_dto: Add_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', add_member_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .insert({ ...add_member_dto })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException(
        'Member not added to organisation',
      );
    }

    return { data };
  }

  // TODO: Test this function
  async addDb(add_db_dto: Add_Db_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', add_db_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    //use the session key to encrypt the database info
    // console.log(key);
    // console.log("second key length" + key.length);
    // const cipher = createCipheriv('aes-256-ctr', key, iv);
    // const textToEncrypt = add_db_dto.db_info;
    // const encryptedText = Buffer.concat([
    //   cipher.update(textToEncrypt),
    //   cipher.final(),
    // ]);
    const encryptedText = this.app_service.encrypt(
      add_db_dto.db_secrets,
      add_db_dto.session_key,
    );

    // TODO: Add to vault and store the secret_id

    const db_fields = {
      name: add_db_dto.name,
      type: add_db_dto.type,
      db_info: add_db_dto.db_info ? add_db_dto.db_info : {},
      host: add_db_dto.host,
      db_secrets: encryptedText,
    };

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .insert({ ...db_fields })
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database not added');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_dbs')
      .insert({ org_id: add_db_dto.org_id, db_id: db_data[0].db_id })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      await this.supabase
        .getClient()
        .from('db_envs')
        .delete()
        .eq('db_id', db_data[0].db_id);
      throw new InternalServerErrorException(
        'Database not added to organisation',
      );
    }

    return { db_data };
  }

  // TODO: Test this function
  async updateOrg(update_org_dto: Update_Org_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', update_org_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('organisations')
      .update({ ...update_org_dto })
      .eq('org_id', update_org_dto.org_id)
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Organisation not updated');
    }

    return { data };
  }

  // TODO: Test this function
  async updateMember(update_member_dto: Update_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', update_member_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .update({ ...update_member_dto })
      .eq('org_id', update_member_dto.org_id)
      .eq('user_id', update_member_dto.user_id)
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Member not updated');
    }

    return { data };
  }

  // TODO: Test this function, allow for updating db_secrets
  async updateDb(update_db_dto: Update_Db_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', update_db_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const db_fields = {
      name: update_db_dto.name,
      type: update_db_dto.type,
      db_info: update_db_dto.db_info,
      host: update_db_dto.host,
    };

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .update({ ...update_db_dto })
      .match({ db_id: update_db_dto.db_id })
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database not updated');
    }

    return { db_data };
  }

  // TODO: Test this function
  async removeOrg(remove_org_dto: Remove_Org_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', remove_org_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('organisations')
      .delete()
      .eq('org_id', remove_org_dto.org_id)
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Organisation not removed');
    }

    return { data };
  }

  // TODO: Test this function
  async removeMember(remove_member_dto: Remove_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('org_id', remove_member_dto.org_id)
      .eq('owner_id', owner_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .delete()
      .eq('org_id', remove_member_dto.org_id)
      .eq('user_id', remove_member_dto.user_id)
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Member not removed');
    }

    return { data };
  }

  // TODO: Test this function
  async removeDb(remove_db_dto: Remove_Db_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', owner_data.user.id)
      .eq('org_id', remove_db_dto.org_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not the owner of this organisation',
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('db_envs')
      .delete()
      .eq('db_id', remove_db_dto.db_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Database not removed');
    }

    return { data };
  }
}
