import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Put,
  UnauthorizedException
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
import { Role } from '../interfaces/rolesJSON';
import { Give_Db_Access_Dto } from './dto/give-db-access.dto';
import { Save_Db_Secrets_Dto } from './dto/save-db-secrets.dto';
import { Remove_Db_Access_Dto } from './dto/remove-db-access.dto';
import { Upload_Org_Logo_Dto } from './dto/upload-org-logo.dto';

@Injectable()
export class OrgManagementService {
  constructor(
    private readonly supabase: Supabase,
    private readonly configService: ConfigService,
    private readonly app_service: AppService
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
    if (org_data.length === 0) {
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
      .select('org_id, user_role, role_permissions, profiles(*)')
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }
  }

  async getDbs(get_dbs_dto: Get_Dbs_Dto) {
    const { data: user_data, error: owner_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw owner_error;
    }

    await this.getDbs_H1(get_dbs_dto.org_id, user_data.user.id);

    // TODO: Add functionality to show only the databases that the user has access to

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
          role_permissions: role_perms
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

  async uploadOrgLogo(
    file: Express.Multer.File,
    upload_org_logo_dto: Upload_Org_Logo_Dto
  ) {
    const bucket_name = 'org_logos';
    const file_path = `${upload_org_logo_dto.org_id}/${file.originalname}`;

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

  async addMember(add_member_dto: Add_Member_Dto) {
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
      .eq('org_id', add_member_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.invite_users) {
      throw new UnauthorizedException(
        'You do not have permission to add members'
      );
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
      view_all_users: false,
      update_db_access: false
    };

    if (add_member_dto.user_role === 'admin') {
      role_perms.add_dbs = true;
      role_perms.update_dbs = true;
      role_perms.remove_dbs = true;
      role_perms.invite_users = true;
      role_perms.remove_users = true;
      role_perms.view_all_dbs = true;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('org_members')
      .insert({ ...add_member_dto, role_permissions: role_perms })
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

  async addDb_H1(add_db_dto: Add_Db_Dto) {
    const db_fields = {
      name: add_db_dto.name,
      type: add_db_dto.type,
      db_info: add_db_dto.db_info ? add_db_dto.db_info : {},
      host: add_db_dto.host
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

    return { db_data };
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.add_dbs) {
      throw new UnauthorizedException('You do not have permission to add dbs');
    }

    const { db_data } = await this.addDb_H1(add_db_dto);

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
        'Database not added to organisation'
      );
    }

    let give_db_access_dto = {
      db_id: db_data[0].db_id,
      org_id: add_db_dto.org_id,
      user_id: user_data.user.id
    }

    await this.giveDbAccess(give_db_access_dto)

    return { data: db_data };
  }

  // TODO: Test this function
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.add_dbs) {
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

  // TODO: Test this function
  async saveDbSecrets(save_db_secrets_dto: Save_Db_Secrets_Dto, session: Record<string, any>) {
    const { data: user_data, error: user_error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    //get the session key
    // const key = save_db_secrets_dto.session_key;

    // use the session key to encrypt the database info
    // console.log(key);
    // console.log("second key length" + key.length);

    const encryptedText = this.app_service.encrypt(
      save_db_secrets_dto.db_secrets,
      session.sessionKey
    );

    const uni_key = this.configService.get('UNI_KEY');

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

  // TODO: Test this function
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (org_data[0].role_permissions.update_user_roles === false) {
      throw new UnauthorizedException(
        'You do not have permission to update user roles'
      );
    }

    update_member_dto = await this.updateMemberHelper(
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

  // TODO: Test this function
  async updateMemberHelper(
    update_member_dto: Update_Member_Dto,
    user_data: any
  ) {
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
              update_user_roles: false,
              view_all_dbs: true,
              view_all_users: false,
              update_db_access: false
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
              view_all_users: false,
              update_db_access: false
            };
          }
          break;
        default:
          throw new InternalServerErrorException('Invalid user role');
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

  // TODO: Test this function, allow for updating db_secrets
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.update_dbs) {
      throw new UnauthorizedException(
        'You do not have permission to update dbs'
      );
    }

    const db_fields = {
      name: update_db_dto.name,
      type: update_db_dto.type,
      db_info: update_db_dto.db_info,
      host: update_db_dto.host
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

    return { data: db_data };
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

  // TODO: Test this function
  async removeMember(remove_member_dto: Remove_Member_Dto) {
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
      .eq('org_id', remove_member_dto.org_id)
      .eq('user_id', user_data.user.id);

    if (org_error) {
      throw org_error;
    }
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (org_data[0].role_permissions.remove_users === false) {
      throw new UnauthorizedException(
        'You do not have permission to remove users'
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
    if (org_data.length === 0) {
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

  // TODO: Test this function
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
    if (org_data.length === 0) {
      throw new UnauthorizedException(
        'You are not a member of this organisation'
      );
    }

    if (!org_data[0].role_permissions.add_dbs) {
      throw new UnauthorizedException(
        'You do not have permission to remove database access from other users'
      );
    }

    const { data: db_data, error: db_error } = await this.supabase
      .getClient()
      .from('db_access')
      .delete()
      .eq('user_id', remove_db_access_dto.user_id)
      .eq('db_id', remove_db_access_dto.user_id)
      .select();

    if (db_error) {
      throw db_error;
    }
    if (db_data.length === 0) {
      throw new InternalServerErrorException('Database access not removed');
    }

    return { data: db_data };
  }
}
