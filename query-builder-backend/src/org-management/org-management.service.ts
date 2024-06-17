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
import { Add_Db_Dto } from "./dto/add-db.dto";
import { Update_Org_Dto } from "./dto/update-org.dto";
import { Update_Member_Dto } from "./dto/update-member.dto";
import { Update_Db_Dto } from "./dto/update-db.dto";
import { Remove_Db_Dto } from "./dto/remove-db.dto";
import { Remove_Member_Dto } from "./dto/remove-member.dto";
import { Remove_Org_Dto } from "./dto/remove-org.dto";

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

    if(org_data.length === 0) {
      throw new UnauthorizedException("You are not the owner of this organisation");
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

  async addDb(add_db_dto: Add_Db_Dto) {
    // TODO: Implement this
    return {};
  }

  async updateOrg(update_org_dto: Update_Org_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("owner_id", owner_data.user.id)
      .eq("org_id", update_org_dto.org_id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    if(org_data.length === 0) {
      throw new UnauthorizedException("You are not the owner of this organisation");
    }

    const { data, error } = await this.supabase.getClient()
      .from("organisations")
      .update({ ...update_org_dto })
      .eq("org_id", update_org_dto.org_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }

  async updateMember(update_member_dto: Update_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("owner_id", owner_data.user.id)
      .eq("org_id", update_member_dto.org_id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    if(org_data.length === 0) {
      throw new UnauthorizedException("You are not the owner of this organisation");
    }

    const { data, error } = await this.supabase.getClient()
      .from("org_members")
      .update({ ...update_member_dto })
      .eq("org_id", update_member_dto.org_id)
      .eq("user_id", update_member_dto.user_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }

  async updateDb(update_db_dto: Update_Db_Dto) {
    // TODO: Implement this
    return {};
  }

  async removeOrg(remove_org_dto: Remove_Org_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("owner_id", owner_data.user.id)
      .eq("org_id", remove_org_dto.org_id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    if(org_data.length === 0) {
      throw new UnauthorizedException("You are not the owner of this organisation");
    }

    const { data, error } = await this.supabase.getClient()
      .from("organisations")
      .delete()
      .eq("org_id", remove_org_dto.org_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }

  async removeMember(remove_member_dto: Remove_Member_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("org_id", remove_member_dto.org_id)
      .eq("owner_id", owner_data.user.id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    if(org_data.length === 0) {
      throw new UnauthorizedException("You are not the owner of this organisation");
    }

    const { data, error } = await this.supabase.getClient()
      .from("org_members")
      .delete()
      .eq("org_id", remove_member_dto.org_id)
      .eq("user_id", remove_member_dto.user_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }

  async removeDb(remove_db_dto: Remove_Db_Dto) {
    const { data: owner_data, error: owner_error } = await this.supabase
      .getClient().auth.getUser(this.supabase.getJwt());

    if (owner_error) {
      throw new InternalServerErrorException(owner_error.message);
    }

    const { data: org_data, error: org_error } = await this.supabase.getClient()
      .from("organisations")
      .select()
      .eq("owner_id", owner_data.user.id)
      .eq("org_id", remove_db_dto.org_id);

    if (org_error) {
      throw new UnauthorizedException(org_error.message);
    }

    const { data, error } = await this.supabase.getClient()
      .from("org_dbs")
      .delete()
      .eq("db_id", remove_db_dto.db_id)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { data };
  }
}
