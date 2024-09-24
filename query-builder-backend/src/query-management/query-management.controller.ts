import { Body, Controller, Get, Post, Put, ValidationPipe } from '@nestjs/common';
import { Save_Query_Dto } from './dto/save-query.dto';
import { Delete_Query_Dto } from './dto/delete-query.dto';
import { QueryManagementService } from './query-management.service';
import { Get_Single_Query_Dto } from './dto/get-single-query.dto';
import { Get_Shareable_Members_Dto } from './dto/get-shareable-members.dto';

@Controller('query-management')
export class QueryManagementController {

  constructor(private readonly query_management_service: QueryManagementService) { }

  @Post("save-query")
  async addDb(@Body(ValidationPipe) save_query_dto: Save_Query_Dto) {
    return this.query_management_service.saveQuery(save_query_dto);
  }

  @Get("get-queries")
  async getQ() {
    return this.query_management_service.getQueries();
  }

  @Put("get-single-query")
  async getSingleQuery(@Body(ValidationPipe) get_single_query_dto: Get_Single_Query_Dto) {
    return this.query_management_service.getSingleQuery(get_single_query_dto);
  }

  @Post("delete-query")
  async deleteQ(@Body(ValidationPipe) delete_query_dto: Delete_Query_Dto) {
    return this.query_management_service.deleteQuery(delete_query_dto);
  }

  @Put("get-shareable-members")
  async getShareableMembers(@Body(ValidationPipe) get_shareable_members_dto: Get_Shareable_Members_Dto) {
    return this.query_management_service.getShareableMembers(get_shareable_members_dto);
  }

}