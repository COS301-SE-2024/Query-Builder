import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Session,
  ValidationPipe,
} from "@nestjs/common";
import { Supabase } from "../supabase";
import { Get_Org_Dto } from "./dto/get-org.dto";
import { Create_Org_Dto } from "./dto/create-org.dto";
import { Add_Member_Dto } from "./dto/add-member.dto";
import { Add_Db_Dto } from "./dto/add-db.dto";
import { Update_Org_Dto } from "./dto/update-org.dto";
import { Update_Member_Dto } from "./dto/update-member.dto";
import { Update_Db_Dto } from "./dto/update-db.dto";
import { Remove_Db_Dto } from "./dto/remove-db.dto";
import { Remove_Org_Dto } from "./dto/remove-org.dto";
import { Remove_Member_Dto } from "./dto/remove-member.dto";
import { OrgManagementService } from "./org-management.service";
import { Get_Members_Dto } from "./dto/get-members.dto";
import { Get_Dbs_Dto } from "./dto/get-dbs.dto";
import { Give_Db_Access_Dto } from "./dto/give-db-access.dto";
import { Remove_Db_Access_Dto } from "./dto/remove-db-access.dto";
import { Save_Db_Secrets_Dto } from "./dto/save-db-secrets.dto";

@Controller("org-management")
export class OrgManagementController {
  constructor(private readonly org_management_service: OrgManagementService) {}

  @Get("get-org")
  async getOrgLoggedIn() {
    return this.org_management_service.getOrgLoggedIn();
  }

  @Put("get-org")
  async getOrg(@Body(ValidationPipe) get_org_dto: Get_Org_Dto) {
    return this.org_management_service.getOrg(get_org_dto);
  }

  @Put("get-members")
  async getMembers(@Body(ValidationPipe) get_members_dto: Get_Members_Dto) {
    return this.org_management_service.getMembers(get_members_dto);
  }

  @Put("get-dbs")
  async getDbs(@Body(ValidationPipe) get_dbs_dto: Get_Dbs_Dto) {
    return this.org_management_service.getDbs(get_dbs_dto);
  }

  @Post("create-org")
  async createOrg(@Body(ValidationPipe) create_org_dto: Create_Org_Dto) {
    return this.org_management_service.createOrg(create_org_dto);
  }

  @Post("add-member")
  async addMember(@Body(ValidationPipe) add_member_dto: Add_Member_Dto) {
    return this.org_management_service.addMember(add_member_dto);
  }

  @Post("add-db")
  async addDb(@Body(ValidationPipe) add_db_dto: Add_Db_Dto) {
    return this.org_management_service.addDb(add_db_dto);
  }

  @Post("give-db-access")
  async giveDbAccess(@Body(ValidationPipe) give_db_access_dto: Give_Db_Access_Dto) {
    return this.org_management_service.giveDbAccess(give_db_access_dto);
  }

  @Post('save-db-secrets')
  async saveDbSecrets(@Body(ValidationPipe) save_db_secrets_dto: Save_Db_Secrets_Dto, @Session() session: Record<string, any>) {
    return this.org_management_service.saveDbSecrets(save_db_secrets_dto, session);
  }

  @Patch("update-org")
  async updateOrg(@Body(ValidationPipe) update_org_dto: Update_Org_Dto) {
    return this.org_management_service.updateOrg(update_org_dto);
  }

  @Patch("update-member")
  async updateMember(
    @Body(ValidationPipe) update_member_dto: Update_Member_Dto) {
    return this.org_management_service.updateMember(update_member_dto);
  }

  @Patch("update-db")
  async updateDb(@Body(ValidationPipe) update_db_dto: Update_Db_Dto) {
    return this.org_management_service.updateDb(update_db_dto);
  }

  @Delete("remove-org")
  async removeOrg(@Body(ValidationPipe) remove_org_dto: Remove_Org_Dto) {
    return this.org_management_service.removeOrg(remove_org_dto);
  }

  @Delete("remove-member")
  async removeMember(
    @Body(ValidationPipe) remove_member_dto: Remove_Member_Dto) {
    return this.org_management_service.removeMember(remove_member_dto);
  }

  @Delete("remove-db")
  async removeDb(@Body(ValidationPipe) remove_db_dto: Remove_Db_Dto) {
    return this.org_management_service.removeDb(remove_db_dto);
  }

  @Delete("remove-db-access")
  async removeDbAccess(@Body(ValidationPipe) remove_db_access_dto: Remove_Db_Access_Dto) {
    return this.org_management_service.removeDbAccess(remove_db_access_dto);
  }
}
