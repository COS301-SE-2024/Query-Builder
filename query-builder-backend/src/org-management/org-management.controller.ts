import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Session,
  UploadedFile,
  UseInterceptors,
  ValidationPipe
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
import { Remove_Org_Dto } from './dto/remove-org.dto';
import { Remove_Member_Dto } from './dto/remove-member.dto';
import { OrgManagementService } from './org-management.service';
import { Get_Members_Dto } from './dto/get-members.dto';
import { Get_Dbs_Dto } from './dto/get-dbs.dto';
import { Give_Db_Access_Dto } from './dto/give-db-access.dto';
import { Remove_Db_Access_Dto } from './dto/remove-db-access.dto';
import { Save_Db_Secrets_Dto } from './dto/save-db-secrets.dto';
import { Upload_Org_Logo_Dto } from './dto/upload-org-logo.dto';
import { Get_Db_Type_Dto } from './dto/get-db-type.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Join_Org_Dto } from './dto/join-org.dto';
import { Create_Hash_Dto } from './dto/create-hash.dto';
import { Has_Saved_Db_Creds_Dto } from './dto/has-saved-db-creds.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Get_Shareable_Members_Dto } from './dto/get-shareable-members.dto';

@ApiTags('org-management')
@Controller('org-management')
export class OrgManagementController {
  constructor(private readonly org_management_service: OrgManagementService) {}

  @Get('get-org')
  @ApiOperation({
    summary: 'Get the organizations of the logged-in user'
  })
  @ApiResponse({status: 200, description: 'The organizations of the logged-in user'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getOrgLoggedIn() {
    return this.org_management_service.getOrgLoggedIn();
  }

  @Put('get-org')
  @ApiOperation({
    summary: 'Get organization details provided an identifier for the organisation'
  })
  @ApiResponse({status: 200, description: 'Organization details retrieved successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  @ApiBody({
    type: Get_Org_Dto,
    description: 'Organization details'
  })
  async getOrg(@Body(ValidationPipe) get_org_dto: Get_Org_Dto) {
    return this.org_management_service.getOrg(get_org_dto);
  }

  @Put('get-members')
  @ApiOperation({
    summary: 'Get members of the organization'
  })
  @ApiResponse({status: 200, description: 'Members retrieved successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async getMembers(@Body(ValidationPipe) get_members_dto: Get_Members_Dto) {
    return this.org_management_service.getMembers(get_members_dto);
  }

  @Put('get-dbs')
  @ApiOperation({
    summary: 'Get databases of the organization'
  })
  @ApiResponse({status: 200, description: 'Databases retrieved successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async getDbs(@Body(ValidationPipe) get_dbs_dto: Get_Dbs_Dto) {
    return this.org_management_service.getDbs(get_dbs_dto);
  }

  @Put('get-db-type')
  async getDbType(@Body(ValidationPipe) get_db_type_dto: Get_Db_Type_Dto) {
    return this.org_management_service.getDbType(get_db_type_dto);
  }

  @Put('get-org-hash')
  @ApiOperation({
    summary: 'Get organization hash'
  })
  @ApiResponse({status: 200, description: 'Organization hash retrieved successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async getOrgHash(@Body(ValidationPipe) get_org_hash_dto: Create_Hash_Dto) {
    return this.org_management_service.getOrgHash(get_org_hash_dto);
  }

  @Post('upload-org-logo')
  @ApiOperation({
    summary: 'Upload organization logo'
  })
  @ApiResponse({status: 201, description: 'Organization logo uploaded successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  @UseInterceptors(FileInterceptor('file'))
  async uploadOrgLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Upload_Org_Logo_Dto
  ) {
    return this.org_management_service.uploadOrgLogo(file, body);
  }

  @Post('create-org')
  @ApiOperation({
    summary: 'Create a new organization'
  })
  @ApiResponse({status: 201, description: 'Organization created successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async createOrg(@Body(ValidationPipe) create_org_dto: Create_Org_Dto) {
    return this.org_management_service.createOrg(create_org_dto);
  }

  @Post('join-org')
  @ApiOperation({
    summary: 'Join an organization'
  })
  @ApiResponse({status: 201, description: 'Joined organization successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async joinOrg(@Body(ValidationPipe) join_org_dto: Join_Org_Dto) {
    return this.org_management_service.joinOrg(join_org_dto);
  }

  @Post('create-hash')
  @ApiOperation({
    summary: 'Create a hash for the organization'
  })
  @ApiResponse({status: 201, description: 'Hash created successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async createHash(@Body(ValidationPipe) create_hash_dto: Create_Hash_Dto) {
    return this.org_management_service.createHash(create_hash_dto);
  }
  
  @Post('add-member')
  @ApiOperation({
    summary: 'Add a member to the organization'
  })
  @ApiResponse({status: 201, description: 'Member added successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async addMember(@Body(ValidationPipe) add_member_dto: Add_Member_Dto) {
    return this.org_management_service.addMember(add_member_dto);
  }

  @Post('add-db')
  @ApiOperation({
    summary: 'Add a database to the organization'
  })
  @ApiResponse({status: 201, description: 'Database added successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async addDb(@Body(ValidationPipe) add_db_dto: Add_Db_Dto) {
    return this.org_management_service.addDb(add_db_dto);
  }

  @Post ('setup-test-scenario')
  @ApiOperation({
    summary: 'Set up a test scenario'
  })
  @ApiResponse({status: 201, description: 'Test scenario set up successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async setUpTestScenario(@Session() session: Record<string, any>) {
    return this.org_management_service.setUpTestScenario(session);
  }

  @Post('give-db-access')
  @ApiOperation({
    summary: 'Give database access to a member'
  })
  @ApiResponse({status: 201, description: 'Database access granted successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async giveDbAccess(
    @Body(ValidationPipe) give_db_access_dto: Give_Db_Access_Dto
  ) {
    return this.org_management_service.giveDbAccess(give_db_access_dto);
  }

  @Post('has-saved-db-credentials')
  @ApiOperation({
    summary: 'Check if saved database credentials exist'
  })
  @ApiResponse({status: 200, description: 'Credentials check completed successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async hasSavedDbCredentials(@Body() has_saved_db_creds_dto: Has_Saved_Db_Creds_Dto) {
    return this.org_management_service.hasSavedDbCredentials(has_saved_db_creds_dto);
  }

  @Post('save-db-secrets')
  @ApiOperation({
    summary: 'Save database secrets'
  })
  @ApiResponse({status: 201, description: 'Database secrets saved successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async saveDbSecrets(
    @Body(ValidationPipe) save_db_secrets_dto: Save_Db_Secrets_Dto,
    @Session() session: Record<string, any>
  ) {
    return this.org_management_service.saveDbSecrets(
      save_db_secrets_dto,
      session
    );
  }

  @Patch('update-org')
  @ApiOperation({
    summary: 'Update organization details'
  })
  @ApiResponse({status: 200, description: 'Organization updated successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async updateOrg(@Body(ValidationPipe) update_org_dto: Update_Org_Dto) {
    return this.org_management_service.updateOrg(update_org_dto);
  }

  @Patch('update-member')
  @ApiOperation({
    summary: 'Update member details'
  })
  @ApiResponse({status: 200, description: 'Member updated successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async updateMember(
    @Body(ValidationPipe) update_member_dto: Update_Member_Dto
  ) {
    return this.org_management_service.updateMember(update_member_dto);
  }

  @Patch('update-db')
  @ApiOperation({
    summary: 'Update database details'
  })
  @ApiResponse({status: 200, description: 'Database updated successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async updateDb(@Body(ValidationPipe) update_db_dto: Update_Db_Dto) {
    return this.org_management_service.updateDb(update_db_dto);
  }

  @Delete('remove-org')
  @ApiOperation({
    summary: 'Remove an organization'
  })
  @ApiResponse({status: 200, description: 'Organization removed successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async removeOrg(@Body(ValidationPipe) remove_org_dto: Remove_Org_Dto) {
    return this.org_management_service.removeOrg(remove_org_dto);
  }

  @Delete('remove-member')
  @ApiOperation({
    summary: 'Remove a member from the organization'
  })
  @ApiResponse({status: 200, description: 'Member removed successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async removeMember(
    @Body(ValidationPipe) remove_member_dto: Remove_Member_Dto
  ) {
    return this.org_management_service.removeMember(remove_member_dto);
  }

  @Delete('remove-db')
  @ApiOperation({
    summary: 'Remove a database from the organization'
  })
  @ApiResponse({status: 200, description: 'Database removed successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async removeDb(@Body(ValidationPipe) remove_db_dto: Remove_Db_Dto) {
    return this.org_management_service.removeDb(remove_db_dto);
  }

  @Delete('remove-db-access')
  @ApiOperation({
    summary: 'Remove database access from a member'
  })
  @ApiResponse({status: 200, description: 'Database access removed successfully'})
  @ApiResponse({status: 400, description: 'Invalid request'})
  async removeDbAccess(
    @Body(ValidationPipe) remove_db_access_dto: Remove_Db_Access_Dto
  ) {
    return this.org_management_service.removeDbAccess(remove_db_access_dto);
  }

  @Put("get-dbaccess-members")
  async getShareableMembers(@Body(ValidationPipe) get_shareable_members_dto: Get_Shareable_Members_Dto) {
    return this.org_management_service.getDBAccessMembers(get_shareable_members_dto);
  }
}
