import { Test, TestingModule } from "@nestjs/testing";
import { OrgManagementController } from "./org-management.controller";
import { Supabase } from "../supabase";
import { ConfigService } from "@nestjs/config";
import { OrgManagementService } from "./org-management.service";
import { AppService } from "../app.service";

describe("OrgManagementController", () => {
  let controller: OrgManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgManagementController],
      providers: [OrgManagementService, Supabase, ConfigService, AppService],
    }).compile();

    controller = module.get<OrgManagementController>(OrgManagementController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
