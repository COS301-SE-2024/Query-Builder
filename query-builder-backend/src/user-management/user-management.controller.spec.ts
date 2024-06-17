import { Test, TestingModule } from "@nestjs/testing";
import { UserManagementController } from "./user-management.controller";
import { UserManagementService } from "./user-management.service";
import { ConfigService } from "@nestjs/config";
import { Supabase } from "../supabase";

describe("UserManagementController", () => {
  let controller: UserManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [UserManagementService, Supabase, ConfigService],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
