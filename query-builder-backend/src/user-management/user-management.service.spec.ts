import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { Supabase, SupabaseModule } from '../supabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Module,
  NotFoundException
} from '@nestjs/common';
import { Create_User_Dto } from './dto/create-user.dto';
import { Get_User_Dto } from './dto/get-user.dto';
import { Sign_In_User_Dto } from './dto/sign-in-user.dto';
import { Update_User_Dto } from './dto/update-user.dto';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let supabase: Supabase;
  let configService: ConfigService;
  let testUser;

  let SupabaseMock = {
    getClient: jest.fn(),
    getJwt: jest.fn()
  };

  testUser = {
    email: null,
    password: 'password',
    first_name: 'Test',
    last_name: 'User',
    user_id: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        UserManagementService,
        {
          provide: Supabase,
          useValue: SupabaseMock
        },
        ConfigService
      ]
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    supabase = await module.resolve<Supabase>(Supabase);
    configService = module.get<ConfigService>(ConfigService);

    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SERVICE_KEY');

    SupabaseMock.getClient.mockReturnValue(
      createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
    );

    let email = 'test' + Math.random().toString(36).substring(7) + '@example.com';

    testUser.email = email;

    const { data } = await SupabaseMock.getClient().auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        first_name: testUser.first_name,
        last_name: testUser.last_name
      }
    });
    testUser.user_id = data.user.id;
  });

  afterEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        UserManagementService,
        {
          provide: Supabase,
          useValue: SupabaseMock
        },
        ConfigService
      ]
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    configService = module.get<ConfigService>(ConfigService);

    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SERVICE_KEY');

    SupabaseMock.getClient.mockReturnValue(
      createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
    );

    const { data } = await SupabaseMock.getClient().auth.admin.deleteUser(
      testUser.user_id
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should get a user (user_id)', async () => {
      const get_user_dto = {
        user_id: testUser.user_id
      };

      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      const supabaseKey = configService.get<string>('SUPABASE_KEY');

      SupabaseMock.getClient.mockReturnValue(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        })
      );

      const user = await service.getUser(get_user_dto);
      expect(user).toBeDefined();
      expect(user.data[0].user_id).toEqual(testUser.user_id);
      expect(user.data[0].email).toEqual(testUser.email);
      expect(user.data[0].first_name).toEqual(testUser.first_name);
      expect(user.data[0].last_name).toEqual(testUser.last_name);
    });

    it('should not get a user (user_id)', async () => {
      const get_user_dto = {
        user_id: '123'
      };

      expect(service.getUser(get_user_dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLoggedInUser', () => {
    beforeEach(async () => {
      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      const supabaseKey = configService.get<string>('SUPABASE_KEY');

      SupabaseMock.getClient.mockReturnValue(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        })
      );

      const { data } = await SupabaseMock.getClient().auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      const jwt = data.session.access_token;

      SupabaseMock.getJwt.mockReturnValue(jwt);
      SupabaseMock.getClient.mockReturnValue(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${jwt}`
            }
          }
        })
      );
    });

    it('should get the logged in user', async () => {
      const user = await service.getLoggedInUser();
      expect(user).toBeDefined();
      expect(user.profile_data[0].user_id).toEqual(testUser.user_id);
      expect(user.profile_data[0].email).toEqual(testUser.email);
      expect(user.profile_data[0].first_name).toEqual(testUser.first_name);
      expect(user.profile_data[0].last_name).toEqual(testUser.last_name);
    });

    it('should throw HttpException', async () => {
      SupabaseMock.getJwt.mockReturnValue(null);
      expect(service.getLoggedInUser()).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    beforeEach(async () => {
      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      const supabaseKey = configService.get<string>('SUPABASE_KEY');

      SupabaseMock.getClient.mockReturnValue(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        })
      );

      const { data } = await SupabaseMock.getClient().auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      const jwt = data.session.access_token;

      SupabaseMock.getJwt.mockReturnValue(jwt);
      SupabaseMock.getClient.mockReturnValue(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${jwt}`
            }
          }
        })
      );
    });

    it('should update a user', async () => {
      const update_user_dto = {
        user_id: testUser.user_id,
        email: testUser.email,
        username: "NewUsername",
        first_name: "John",
        last_name: "Doe"
      };

      const updated_user = await service.updateUser(update_user_dto);
      expect(updated_user).toBeDefined();
      expect(updated_user.data[0].user_id).toEqual(testUser.user_id);
      expect(updated_user.data[0].email).toEqual(testUser.email);
      expect(updated_user.data[0].first_name).toEqual(update_user_dto.first_name);
      expect(updated_user.data[0].last_name).toEqual(update_user_dto.last_name);
      expect(updated_user.data[0].username).toEqual(update_user_dto.username);
    });

    it('should throw HttpException', async () => {
      const update_user_dto = {
        user_id: '123',
        email: testUser.email,
        first_name: 'John',
        last_name: 'Doe'
      };

      SupabaseMock.getJwt.mockReturnValue(null);

      expect(service.updateUser(update_user_dto)).rejects.toThrow(HttpException);
    });
  });
});
