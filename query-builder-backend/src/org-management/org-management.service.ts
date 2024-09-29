import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
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
import { Role } from '../interfaces/rolesJSON';
import { Give_Db_Access_Dto } from './dto/give-db-access.dto';
import { Save_Db_Secrets_Dto } from './dto/save-db-secrets.dto';
import { Remove_Db_Access_Dto } from './dto/remove-db-access.dto';
import { Upload_Org_Logo_Dto } from './dto/upload-org-logo.dto';
import { Join_Org_Dto } from './dto/join-org.dto';
import { Create_Hash_Dto } from './dto/create-hash.dto';
import * as crypto from 'crypto';
import { Has_Saved_Db_Creds_Dto } from './dto/has-saved-db-creds.dto';
import { Get_Db_Type_Dto } from './dto/get-db-type.dto';
import { Get_Shareable_Members_Dto } from './dto/get-shareable-members.dto';

@Injectable()
export class OrgManagementService {
  constructor(
    private readonly supabase: Supabase,
    private readonly config_service: ConfigService,
    public readonly app_service: AppService
  ) {}

  async deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(
          source[key],
          await this.deepMerge(target[key], source[key])
        );
      }
    }

    // Object.assign() does not throw away the original target object,
    // it merges source properties into it, hence creating a deep merge
    Object.assign(target || {}, source);
    return target;
  }

  async getOrg(org: Get_Org_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('organisations')
      .select(`org_id, created_at, name, logo, org_members(*), db_envs(*)`)
      .match({ ...org });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('Organisation not found');
    }

    return { data };
  }

  async getOrgLoggedIn() {

    //get the currently logged-in user
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (error) {
      throw error;
    }

    //get the id of the currently logged-in user
    const user_id = data.user.id;

    //do inner joins across 4 tables to get the organisations a user is in,
    //and the db_envs they have access to in them
    const { data: org_data, error: org_data_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select('org_id, name, org_members!inner(role_permissions), db_envs!inner(db_id, name, db_access!inner(user_id))')
      .eq('org_members.user_id', user_id);

    if (org_data_error) {
      throw org_data_error;
    }
    if (org_data.length === 0) {
      throw new NotFoundException('Organisation not found');
    }

    // Remove db_envs the user doesn't have access to
    for (let org of org_data) {
      org.db_envs = org.db_envs.filter(db_env => {
        return db_env.db_access.some(access => access.user_id === user_id);
      }).map(db_env => {
        delete db_env.db_access;
        return db_env;
      });
    }

    return { data: org_data };

  }

  async getMembers_H1(orgId: string, userId: string) {
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.view_all_users) {
      throw new UnauthorizedException(
        'You do not have permission to view all members'
      );
    }
  }

  async getMembers(get_members_dto: Get_Members_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    await this.getMembers_H1(get_members_dto.org_id, user_data.user.id);

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .select('org_id, user_role, role_permissions, verified, profiles(*)')
      .match({ ...get_members_dto });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('Members not found');
    }

    return { data };
  }

  async getDbs_H1(org_id, user_id) {
    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', org_id)
      .eq('user_id', user_id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    return org_data;
  }

  async getDbs_H2(user_id) {
    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .select('db_id')
      .eq('user_id', user_id);

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new NotFoundException('Databases not found');
    }

    return db_data;
  }

  async getDbs(get_dbs_dto: Get_Dbs_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const org_data = await this.getDbs_H1(
      get_dbs_dto.org_id,
      user_data.user.id
    );

    if (org_data[0].role_permissions.view_all_dbs === true) {
      const { data, error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('org_id, db_id, created_at, name, type')
        .match({ ...get_dbs_dto });

      if (error) {
        throw error;
      }
      if (data.length === 0) {
        throw new NotFoundException('Databases not found');
      }

      return { data };
    } else {
      const db_data = await this.getDbs_H2(user_data.user.id);

      const db_ids = db_data.map((db) => db.db_id);

      const { data, error } = await this.supabase
        .getClient()
        .from('db_envs')
        .select('org_id, db_id, created_at, name, type')
        .eq('org_id', get_dbs_dto.org_id)
        .in('db_id', db_ids);

      if (error) {
        throw error;
      }
      if (data.length === 0) {
        throw new NotFoundException('Databases not found');
      }

      return { data };
    }
  }

  async getDbType(get_db_type_dto: Get_Db_Type_Dto){

    const { data, error } = await this.supabase
    .getClient()
    .from('db_envs')
    .select('type')
    .match({ ...get_db_type_dto })
    .single();

    if (error) {
      throw error;
    }
    if (!data || !data.type) {
      throw new NotFoundException('Database not found');
    }

    return {type: data.type};

  }

  async getOrgHash(create_hash_dto: Create_Hash_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('org_hashes')
      .select()
      .match({ ...create_hash_dto });

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new NotFoundException('No organisations match the provided hash');
    }

    return { data };
  }

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

    await this.createOrg_H1(create_org_dto.owner_id, data[0].org_id);

    return { data };
  }

  async createOrg_H1(owner_id, org_id) {
    const role_perms: Role = {
      is_owner: true,
      add_dbs: true,
      update_dbs: true,
      remove_dbs: true,
      invite_users: true,
      remove_users: true,
      update_user_roles: true,
      view_all_dbs: true,
      view_all_users: true,
      update_db_access: true
    };

    const { data: org_member_data, error: org_member_error } =
      await this.supabase
        .getClient()
        .from('org_members')
        .insert({
          org_id: org_id,
          user_id: owner_id,
          user_role: 'owner',
          role_permissions: role_perms,
          verified: true
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
        .eq('org_id', org_id);
      throw new InternalServerErrorException('Owner not added to organisation');
    }
  }

  async uploadOrgLogo(file: Express.Multer.File, body: Upload_Org_Logo_Dto) {
    const bucket_name = 'org_logos';
    const file_path = `${body.org_id}/${file.originalname}`;

    const { data, error } = await this.supabase
      .getClient()
      .storage.from(bucket_name)
      .upload(file_path, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      throw error;
    }
    if (data === null) {
      throw new InternalServerErrorException('Failed to upload file');
    }

    const { data: img_url } = await this.supabase
      .getClient()
      .storage.from(bucket_name)
      .getPublicUrl(file_path);

    return img_url;
  }

  async joinOrg(join_org_dto: Join_Org_Dto) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const { data: hash_data, error: hash_error } = await this.supabase
      .getClient()
      .from('org_hashes')
      .select()
      .match({ ...join_org_dto });

    if (hash_error) {
      throw hash_error;
    }
    if (hash_data.length === 0) {
      throw new NotFoundException('No organisations match the provided hash');
    }

    const role_perms: Role = {
      is_owner: false,
      add_dbs: false,
      update_dbs: false,
      remove_dbs: false,
      invite_users: false,
      remove_users: false,
      update_user_roles: false,
      view_all_dbs: false,
      view_all_users: true,
      update_db_access: false
    };

    await this.joinOrg_H1(hash_data, user_data);

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .insert({
        org_id: hash_data[0].org_id,
        user_id: user_data.user.id,
        user_role: 'member',
        role_permissions: role_perms
      })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException(
        'Member not added to organisation'
      );
    }

    return { data };
  }

  async joinOrg_H1(hash_data, user_data) {
    const { data: in_org, error: in_org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', hash_data[0].org_id)
      .eq('user_id', user_data.user.id);

    if (in_org_error) {
      throw in_org_error;
    }
    if (in_org.length !== 0) {
      throw new BadRequestException('You are already a member of this org');
    }
  }

  async createHash(create_hash_dto: Create_Hash_Dto) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', create_hash_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.invite_users) {
      throw new UnauthorizedException(
        'You do not have permission to add members'
      );
    }

    let hashCode = await this.createHash_H1(create_hash_dto.org_id);

    const { data: hash_data, error: hash_error } = await this.createHash_H3(
      create_hash_dto,
      hashCode
    );

    return { data: hash_data };
  }

  async createHash_H1(org_id: string) {
    let salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto.createHash('sha256');
    hash.update(org_id + salt);
    let hashCode = hash.digest('hex');

    return hashCode;
  }

  async createHash_H2(org_id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('org_hashes')
      .select()
      .eq('org_id', org_id);

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      return false;
    }

    return true;
  }

  async createHash_H3(create_hash_dto: Create_Hash_Dto, hashCode: string) {
    if (await this.createHash_H2(create_hash_dto.org_id)) {
      const { data, error } = await this.supabase
        .getClient()
        .from('org_hashes')
        .update({ hash: hashCode })
        .eq('org_id', create_hash_dto.org_id)
        .select();

      if (error) {
        throw error;
      }
      if (data.length === 0) {
        throw new InternalServerErrorException('Unable to save org hash');
      }

      return { data, error };
    } else {
      const { data, error } = await this.supabase
        .getClient()
        .from('org_hashes')
        .insert({ org_id: create_hash_dto.org_id, hash: hashCode })
        .select();

      if (error) {
        throw error;
      }
      if (data.length === 0) {
        throw new InternalServerErrorException('Unable to save org hash');
      }

      return { data, error };
    }
  }

  async addMember(add_member_dto: Add_Member_Dto) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', add_member_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.invite_users) {
      throw new UnauthorizedException(
        'You do not have permission to add members'
      );
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .update({ verified: true })
      .match({ ...add_member_dto })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException('Member not verified');
    }

    return { data };
  }

  async addDb(add_db_dto: Add_Db_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', add_db_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.add_dbs) {
      throw new UnauthorizedException('You do not have permission to add dbs');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('db_envs')
      .insert({ ...add_db_dto })
      .select();

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new InternalServerErrorException(
        'Database not added to organisation'
      );
    }

    let give_db_access_dto = {
      db_id: data[0].db_id,
      org_id: add_db_dto.org_id,
      user_id: user_data.user.id
    };

    await this.giveDbAccess(give_db_access_dto);

    return { data };
  }

  // async addDb_H1(add_db_dto: Add_Db_Dto) {
  //   const db_fields = {
  //     name: add_db_dto.name,
  //     type: add_db_dto.type,
  //     db_info: add_db_dto.db_info ? add_db_dto.db_info : {},
  //     host: add_db_dto.host
  //   };

  //   const { data: db_data, error: db_error } = await this.supabase
  //     .getClient()
  //     .from('db_envs')
  //     .insert({ ...db_fields })
  //     .select();

  //   if (db_error) {
  //     throw db_error;
  //   }
  //   if (db_data.length === 0) {
  //     throw new InternalServerErrorException('Database not added');
  //   }

  //   return { db_data };
  // }

  async setUpTestScenario(session: Record<string, any>) {

    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    // Get name and surname
    const { data: profile_data, error: profile_error } = await this.supabase
      .getClient()
      .from('profiles')
      .select()
      .eq('user_id', user_data.user.id);

    if (profile_error) {
      throw profile_error;
    }

    //Check if a user has already been onboarded
    if(profile_data[0].onboarded){
      return {data: "User has already been onboarded"};
    }

    // Create org for them if it doesnt exist
    let { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('organisations')
      .select()
      .eq('owner_id', user_data.user.id)
      .eq('name', `${profile_data[0].first_name}'s Organisation`);

    if (org_error) {
      throw org_error;
    }

    if (org_data.length === 0) {
      const create_org_dto = {
        owner_id: user_data.user.id,
        name: `${profile_data[0].first_name}'s Organisation`
      };

      const { data: org_created_data } = await this.createOrg(create_org_dto);
      org_data = org_created_data;
    }

    // Add database to organisation if not already added
    let { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .select()
      .eq('org_id', org_data[0].org_id)
      .eq('name', 'Test Database');

    if(db_error) {
      throw db_error;
    }

    if (db_data.length === 0) {
      const add_db_dto = {
        org_id: org_data[0].org_id,
        name: 'Test Database',
        type: 'mysql',
        host: 'capstone-qbee-db.dns.net.za',
        port: 3306
      };

      const { data: db_created_data } = await this.addDb(add_db_dto);
      db_data = db_created_data;
    }

    //create a db_secrets object
    const db_secrets = {
      user: 'qbeeuser',
      password: 'password'
    }

    // Add database secrets to said database
    const save_db_secrets_dto = {
      db_id: db_data[0].db_id,
      db_secrets: JSON.stringify(db_secrets)
    };

    const { data: db_secrets_data } = await this.saveDbSecrets(save_db_secrets_dto, session);

    //Confirm the user has been onboarded
    const { data: onboard_data, error: onboard_error } = await this.supabase
    .getClient()
    .from('profiles')
    .update({ onboarded: true })
    .match({ user_id: user_data.user.id})
    .select();

    if(onboard_error){
      throw onboard_error;
    }

    return { data: "User has been onboarded" };

  }

  async giveDbAccess(give_db_access_dto: Give_Db_Access_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', give_db_access_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.update_db_access) {
      throw new UnauthorizedException(
        'You do not have permission to give database access to other users'
      );
    }

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .insert({
        user_id: give_db_access_dto.user_id,
        db_id: give_db_access_dto.db_id
      })
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database access not given');
    }

    return { data: db_data };
  }

  async hasSavedDbCredentials(has_saved_db_creds_dto: Has_Saved_Db_Creds_Dto) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('db_access')
      .select('db_secrets')
      .eq('user_id', user_data.user.id)
      .eq('db_id', has_saved_db_creds_dto.db_id);

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new UnauthorizedException(
        'You do not have access to this database'
      );
    }

    return {
      saved_db_credentials: data[0].db_secrets !== null ? true : false
    };
  }

  async saveDbSecrets(
    save_db_secrets_dto: Save_Db_Secrets_Dto,
    session: Record<string, any>
  ) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    if (!session.sessionKey) {
      throw new InternalServerErrorException(
        'You do not have a backend session'
      );
    }

    const encryptedText = this.app_service.encrypt(
      save_db_secrets_dto.db_secrets,
      session.sessionKey
    );

    const uni_key = this.config_service.get('UNI_KEY');

    const second_encryptedText = this.app_service.encrypt(
      encryptedText,
      uni_key
    );

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .update({ db_secrets: second_encryptedText })
      .match({ user_id: user_data.user.id, db_id: save_db_secrets_dto.db_id })
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database secrets not saved');
    }

    return { data: db_data };
  }

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
        'You are not the owner of this organisation'
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

  async updateMember(update_member_dto: Update_Member_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', update_member_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (org_data[0].role_permissions.update_user_roles === false) {
      throw new UnauthorizedException(
        'You do not have permission to update user roles'
      );
    }

    update_member_dto = await this.updateMember_H1(
      update_member_dto,
      user_data
    );

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

  async updateMember_H1(update_member_dto: Update_Member_Dto, user_data: any) {
    if (!update_member_dto.role_permissions) {
      update_member_dto.role_permissions = {};

      const { data: member_data, error: member_error } = await this.supabase
        .getClient()
        .from('org_members')
        .select()
        .eq('org_id', update_member_dto.org_id)
        .eq('user_id', update_member_dto.user_id);

      if (member_error) {
        throw member_error;
      }

      switch (update_member_dto.user_role) {
        case 'admin':
          if (
            member_data[0].user_role === 'owner' ||
            member_data[0].user_id === user_data.user.id
          ) {
            throw new UnauthorizedException(
              'You cannot update this users role'
            );
          } else {
            update_member_dto.role_permissions = {
              is_owner: false,
              add_dbs: true,
              update_dbs: true,
              remove_dbs: true,
              invite_users: true,
              remove_users: true,
              update_user_roles: true,
              view_all_dbs: true,
              view_all_users: true,
              update_db_access: true
            };
          }
          break;
        case 'member':
          if (
            member_data[0].user_role === 'owner' ||
            member_data[0].user_id === user_data.user.id
          ) {
            throw new UnauthorizedException(
              'You cannot update this users role'
            );
          } else {
            update_member_dto.role_permissions = {
              is_owner: false,
              add_dbs: false,
              update_dbs: false,
              remove_dbs: false,
              invite_users: false,
              remove_users: false,
              update_user_roles: false,
              view_all_dbs: false,
              view_all_users: true,
              update_db_access: false
            };
          }
          break;
      }
    } else {
      const { data: member_data, error: member_error } = await this.supabase
        .getClient()
        .from('org_members')
        .select()
        .eq('org_id', update_member_dto.org_id)
        .eq('user_id', update_member_dto.user_id);

      if (member_error) {
        throw member_error;
      }

      switch (update_member_dto.user_role) {
        case 'admin':
          if (
            member_data[0].user_role === 'owner' ||
            member_data[0].user_id === user_data.user.id
          ) {
            throw new UnauthorizedException(
              'You cannot update this users role'
            );
          } else {
            update_member_dto.role_permissions = await this.deepMerge(
              member_data[0].role_permissions,
              update_member_dto.role_permissions
            );
            update_member_dto.role_permissions.is_owner = false;
          }
          break;
        case 'member':
          if (
            member_data[0].user_role === 'owner' ||
            member_data[0].user_id === user_data.user.id
          ) {
            throw new UnauthorizedException(
              'You cannot update this users role'
            );
          } else {
            update_member_dto.role_permissions = await this.deepMerge(
              member_data[0].role_permissions,
              update_member_dto.role_permissions
            );
            update_member_dto.role_permissions.is_owner = false;
          }
      }
    }

    return update_member_dto;
  }

  async updateDb(update_db_dto: Update_Db_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', update_db_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.update_dbs) {
      throw new UnauthorizedException(
        'You do not have permission to update databases'
      );
    }

    const db_fields = {
      name: update_db_dto.name,
      type: update_db_dto.type,
      db_info: update_db_dto.db_info,
      host: update_db_dto.host,
      port: update_db_dto.port
    };

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_envs')
      .update({ ...db_fields })
      .match({ db_id: update_db_dto.db_id })
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database not updated');
    }

    return { data: db_data };
  }

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
        'You are not the owner of this organisation'
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

  async removeMember(remove_member_dto: Remove_Member_Dto) {

    //remover_data contains information about the user doing the removing
    const { data: remover_data, error: remover_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (remover_error) {
      throw remover_error;
    }

    //get the line showing that the user doing the removing is a member of the organisation
    const { data: remover_member_data, error: remover_member_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', remove_member_dto.org_id)
      .eq('user_id', remover_data.user.id);

    if (remover_member_error) {
      throw remover_member_error;
    }
    if (remover_member_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    //get the line showing that the user being removed is a member of the organisation
    const { data: removee_member_data, error: removee_member_error } = await this.supabase
    .getClient()
    .from('org_members')
    .select()
    .eq('org_id', remove_member_dto.org_id)
    .eq('user_id', remove_member_dto.user_id);

    if (removee_member_error) {
      throw removee_member_error;
    }
    if (removee_member_data.length === 0) {
      throw new UnauthorizedException(
        'The person you are trying to remove is not a member of this organisation'
      );
    }

    //remove_member_dto.user_id is the id of the user being removed
    //you can not remove the owner of an organisation
    if(removee_member_data[0].user_role === "owner"){
      throw new UnauthorizedException(
        'You can not remove the owner of the organisation'
      );
    }
    //you need to have the permission to remove users if you are trying to remove someone other than yourself
    else if (remover_member_data[0].role_permissions.remove_users === false && remover_data.user.id !== remove_member_dto.user_id) {
      throw new UnauthorizedException(
        'You do not have permission to remove users other than yourself'
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

  async removeDb(remove_db_dto: Remove_Db_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', remove_db_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.remove_dbs) {
      throw new UnauthorizedException(
        'You do not have permission to remove databases'
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

  async removeDbAccess(remove_db_access_dto: Remove_Db_Access_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    const { data: org_data, error: org_error } = await this.supabase
      .getClient()
      .from('org_members')
      .select()
      .eq('org_id', remove_db_access_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0 || org_data[0].verified === false) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.update_db_access) {
      throw new UnauthorizedException(
        'You do not have permission to remove database access for other users'
      );
    }

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .delete()
      .eq('user_id', remove_db_access_dto.user_id)
      .eq('db_id', remove_db_access_dto.db_id)
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database access not removed');
    }

    return { data: db_data };
  }

  async getDBAccessMembers(
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
      .select('user_id, user_role, profiles(*)')
      .eq('org_id', org_data.org_id)
      // .neq('user_id', user_data.user.id)
      .neq('user_role', 'owner');

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

    const accessSet = new Set(db_access_data.map((db_access) => db_access.user_id));

    // Map the members_data to include the 'access' field
    const updated_members_data = members_data.map((member) => {
      const profiles: any = member.profiles;
      return {
        user_id: member.user_id,
        full_name: `${profiles.first_name} ${profiles.last_name}`,
        profile_photo: profiles.profile_photo,
        access: accessSet.has(member.user_id) // true if the user_id is in the access set, false otherwise
      };
    });

    return { data: updated_members_data };
  }
}
