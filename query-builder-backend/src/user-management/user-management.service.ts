import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Session,
} from "@nestjs/common";
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { Get_User_Dto } from "./dto/get-user.dto";
import { Supabase } from "../supabase";
import { Create_User_Dto } from "./dto/create-user.dto";
import { Sign_In_User_Dto } from "./dto/sign-in-user.dto";
import { Update_User_Dto } from "./dto/update-user.dto";
import { AuthApiError, PostgrestError } from '@supabase/supabase-js';

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

    return { profile_data };
  }

  async signIn(user: Sign_In_User_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

    if (error) {
      throw error;
    }

    //generate a session key using a key derivation function
    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(user.password, 'salt', 32)) as Buffer;    
    console.log(key);
    console.log("first key length" + key.length);

    return { data, sessionKey: key.toString('base64') };
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
