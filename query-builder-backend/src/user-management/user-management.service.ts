import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { Get_User_Dto } from './dto/get-user.dto';
import { Supabase } from '../supabase';
import { Create_User_Dto } from './dto/create-user.dto';
import { Sign_In_User_Dto } from './dto/sign-in-user.dto';
import { Update_User_Dto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserManagementService {
  constructor(private supabase: Supabase, private configService: ConfigService) {}

  async getUser(user: Get_User_Dto): Promise<any> {
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select()
      .match({ ...user });

    if (error) {
      throw new NotFoundException(error.message);
    }

    if(data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { data };
  }

  async getLoggedInUser() {
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(this.supabase.getJwt());

    if (error) {
      throw new NotFoundException(error.message);
    }

    const user_id = data.user.id;

    const { data: profile_data, error: profile_error } = await this.supabase
      .getClient()
      .from('profiles')
      .select()
      .eq('user_id', user_id);

    if (profile_error) {
      throw new NotFoundException(profile_error.message);
    }

    if(profile_data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { profile_data };
  }

  async signIn(user: Sign_In_User_Dto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

    if (error) {
      throw new HttpException(error.message, error.status);
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
          last_name: user.last_name
        }
      }
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
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
          last_name: user.last_name
        }
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }

  async updateUser(user: Update_User_Dto) {
    const {
      data: { user: user_data },
      error: user_error
    } = await this.supabase.getClient().auth.getUser(this.supabase.getJwt());

    if (user_error || !user_data) {
      throw new HttpException(user_error.message, user_error.status);
    }

    const user_id = user_data.id;

    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .update({ ...user })
      .eq('user_id', user_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if(data.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { data };
  }

  async updateUserPassword(user: Update_User_Dto) {
    return { data: 'Not implemented' };
  }

  async updateUserPhone(user: Update_User_Dto) {
    return { data: 'Not implemented' };
  }
}
