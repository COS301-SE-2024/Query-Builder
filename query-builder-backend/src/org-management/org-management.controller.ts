import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
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
    // TODO: Implement this
    return {};
  }

  @Patch("update-org")
  async updateOrg(@Body(ValidationPipe) update_org_dto: Update_Org_Dto) {
    // TODO: Implement this
    return {};
  }

  @Patch("update-member")
  async updateMember(
    @Body(ValidationPipe) update_member_dto: Update_Member_Dto) {
    // TODO: Implement this
    return {};
  }

  @Patch("update-db")
  async updateDb(@Body(ValidationPipe) update_db_dto: Update_Db_Dto) {
    // TODO: Implement this
    return {};
  }

  @Delete("remove-org")
  async removeOrg(@Body(ValidationPipe) remove_org_dto: Remove_Org_Dto) {
    // TODO: Implement this
    return {};
  }

  @Delete("remove-member")
  async removeMember(
    @Body(ValidationPipe) remove_member_dto: Remove_Member_Dto,
  ) {
    // TODO: Implement this
    return {};
  }

  @Delete("remove-db")
  async removeDb(@Body(ValidationPipe) remove_db_dto: Remove_Db_Dto) {
    // TODO: Implement this
    return {};
  }
}
