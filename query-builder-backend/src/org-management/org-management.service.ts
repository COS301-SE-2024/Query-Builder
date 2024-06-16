import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Supabase } from "../supabase";
import { Get_Org_Dto } from "./dto/get-org.dto";
import { Create_Org_Dto } from "./dto/create-org.dto";
import { Add_Member_Dto } from "./dto/add-member.dto";

@Injectable()
export class OrgManagementService {
  constructor(private supabase: Supabase) {}

  async getOrg(org: Get_Org_Dto) {
    const { data, error } = await this.supabase.getClient()
      .from("organisations")
      .select(`org_id, created_at, name, logo, org_members(*)`)
      .match({ ...org });

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { data };
  }

  async getOrgLoggedIn() {
    const { data, error } = await this.supabase.getClient().auth.getUser(
      this.supabase.getJwt(),
    );

    if (error) {
      throw new NotFoundException(error.message);
    }

    const user_id = data.user.id;

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select("org_id, created_at, name, logo, org_members(*)")
      .eq("owner_id", user_id);

    if (org_error) {
      throw new NotFoundException(org_error.message);
    }

    return { org_data };
  }

  async createOrg(create_org_dto: Create_Org_Dto) {
    if (create_org_dto.owner_id === undefined) {
      const { data: org_owner, error: org_owner_error } = await this.supabase
        .getClient().auth.getUser(this.supabase.getJwt());

      if (org_owner_error) {
        throw new InternalServerErrorException(org_owner_error.message);
      }

      let owner_id = org_owner.user.id;
      create_org_dto.owner_id = owner_id;
    }

    const { data, error } = await this.supabase.getClient()
      .from("organisations")
      .insert({ ...create_org_dto })
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: org_member_data, error: org_member_error } = await this
      .supabase.getClient()
      .from("org_members")
      .insert({
        org_id: data[0].org_id,
        user_id: create_org_dto.owner_id,
        user_role: "owner",
      });

    if (org_member_error) {
      throw new InternalServerErrorException(org_member_error.message);
    }

    return { data };
  }

  async addMember(add_member_dto: Add_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("owner_id", owner_data.user.id)
      .eq("org_id", add_member_dto.org_id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    const { data, error } = await this.supabase.getClient()
      .from("org_members")
      .insert({ ...add_member_dto })
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }
}
