import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Session,
} from '@nestjs/common';
import { scrypt } from 'crypto';
import { promisify } from 'util';
import { Get_User_Dto } from './dto/get-user.dto';
import { Supabase } from '../supabase';
import { Create_User_Dto } from './dto/create-user.dto';
import { Sign_In_User_Dto } from './dto/sign-in-user.dto';
import { Update_User_Dto } from './dto/update-user.dto';

@Injectable()
export class UserManagementService {
  constructor(private supabase: Supabase) {}

  // TODO: Test this function
  async getUser(user: Get_User_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select()
      .match({ ...user });

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { data };
  }

  // TODO: Test this function
  async getLoggedInUser() {
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (error) {
      throw error;
    }

    const user_id = data.user.id;

    const { data: profile_data, error: profile_error } = await this.supabase
      .getClient()
      .from('profiles')
      .select()
      .eq('user_id', user_id);

    if (profile_error) {
      throw profile_error;
    }
    if (profile_data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { data: profile_data };
  }

  async genSessionKey(user: Sign_In_User_Dto, session: Record<string, any>) {
    const key = (await promisify(scrypt)(user.password, 'salt', 32)) as Buffer;

    session.sessionKey = key.toString('base64');

    return { data: { success: true } };
  }

  async signIn(user: Sign_In_User_Dto){
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

    if (error) {
      throw error;
    }

    return { data };
  }

  async signUp(user: Create_User_Dto) {
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
    });

    if (error) {
      throw error;
    }

    return { data };
  }

  async createUser(user: Create_User_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.admin.createUser({
        email: user.email,
        password: user.password,
        phone: user.phone,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });

    if (error) {
      throw error;
    }

    return { data };
  }

  // TODO: Test this function
  async updateUser(user: Update_User_Dto) {
    const {
      data: { user: user_data },
      error: user_error,
    } = await this.supabase.getClient().auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const user_id = user_data.id;

    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .update({ ...user })
      .eq('user_id', user_id)
      .select();

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { data };
  }

  async uploadProfilePhoto(file: Express.Multer.File) {
    const {
      data: { user: user_data },
      error: user_error,
    } = await this.supabase.getClient().auth.getUser(this.supabase.getJwt());

    if (user_error) {
      throw user_error;
    }

    const user_id = user_data.id;

    const bucket_name = 'profile_photos';
    const file_path = `${user_id}/${file.originalname}`;

    const { data, error } = await this.supabase
      .getClient()
      .storage.from(bucket_name)
      .upload(file_path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
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

  async updateUserPassword(user: Update_User_Dto) {
    return { data: 'Not implemented' };
  }

  async updateUserEmail(user: Update_User_Dto) {
    return { data: 'Not implemented' };
  }

  async updateUserPhone(user: Update_User_Dto) {
    return { data: 'Not implemented' };
  }
}
