import { Test, TestingModule } from '@nestjs/testing';
import { OrgManagementService } from './org-management.service';
import { Supabase } from '../supabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotFoundException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { UserManagementService } from 'src/user-management/user-management.service';
import exp from 'constants';
import { Add_Db_Dto } from './dto/add-db.dto';
import { Add_Member_Dto } from './dto/add-member.dto';
import { Create_Org_Dto } from './dto/create-org.dto';
import { Get_Dbs_Dto } from './dto/get-dbs.dto';
import { Get_Members_Dto } from './dto/get-members.dto';
import { Get_Org_Dto } from './dto/get-org.dto';
import { Remove_Db_Dto } from './dto/remove-db.dto';
import { Remove_Member_Dto } from './dto/remove-member.dto';
import { Remove_Org_Dto } from './dto/remove-org.dto';
import { Update_Db_Dto } from './dto/update-db.dto';
import { Update_Member_Dto } from './dto/update-member.dto';
import { Update_Org_Dto } from './dto/update-org.dto';
import { rejects } from 'assert';
import { resolve } from 'dns';
import { get } from 'http';
import { from } from 'rxjs';

describe('OrgManagementService', () => {
  let service: OrgManagementService;
  let supabase: Supabase;
  let configService: ConfigService;
  let testUser;
  let testOrg;

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

  testOrg = {
    name: 'Test Org',
    org_id: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        OrgManagementService,
        { provide: Supabase, useValue: SupabaseMock },
        ConfigService
      ]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
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

    const { data: user_data } = await SupabaseMock.getClient().auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        first_name: testUser.first_name,
        last_name: testUser.last_name
      }
    });
    testUser.user_id = user_data.user.id;

    const { data } = await SupabaseMock.getClient()
        .from('organisations')
        .insert({
          name: testOrg.name,
          owner_id: testUser.user_id
        })
        .select();
      testOrg.org_id = data[0].org_id;

    await SupabaseMock.getClient().from('org_members').insert(
      {
        org_id: data[0].org_id,
        user_id: testUser.user_id,
        user_role: 'owner'
      }
    );
  });

  afterEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        OrgManagementService,
        { provide: Supabase, useValue: SupabaseMock },
        ConfigService
      ]
    }).compile();

    service = module.get<OrgManagementService>(OrgManagementService);
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

    await SupabaseMock.getClient().auth.admin.deleteUser(testUser.user_id);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('getOrg', () => {
    it('should return an organization', async () => {
      const org = await service.getOrg({ org_id: testOrg.org_id });
      expect(org).toBeDefined();
    });

    it('should throw a NotFoundException if the organization does not exist', async () => {
      expect(service.getOrg({ org_id: 'invalid' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrgLoggedIn', () => {
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

    it('should return an organization', async () => {
      const org = await service.getOrgLoggedIn();
      expect(org).toBeDefined();
      expect(org.data[0].org_id).toEqual(testOrg.org_id);
      expect(org.data[0].name).toEqual(testOrg.name);
    });
    it('should throw a NotFoundException if the organization does not exist', async () => {
      expect(service.getOrgLoggedIn()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMembers', () => {
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

    it('should return an array of members', async () => {
      const members = await service.getMembers({ org_id: testOrg.org_id });
      expect(members).toBeDefined();
    });

    it('should throw a Unauthorised exception if the organisation cannot resolve the owner', async () => {
      expect(service.getMembers({ org_id: '781f9a26-4a5d-4091-87c3-6c6ad06aa939' })).rejects.toThrow(HttpException);
    });
  });
  
  describe('getDbs', () => {});
  describe('createOrg', () => {});
  describe('addMember', () => {});
  describe('addDb', () => {});
  describe('updateOrg', () => {});
  describe('updateMember', () => {});
  describe('updateDb', () => {});
  describe('removeOrg', () => {});
  describe('removeMember', () => {});
  describe('removeDb', () => {});
});
