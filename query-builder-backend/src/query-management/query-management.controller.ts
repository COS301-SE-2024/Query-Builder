import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { Save_Query_Dto } from './dto/save-query.dto';
import { QueryManagementService } from './query-management.service';

@Controller('query-management')
export class QueryManagementController {

    constructor(private readonly query_management_service: QueryManagementService) {}

    @Post("save-query")
    async addDb(@Body(ValidationPipe) save_query_dto: Save_Query_Dto) {
      return this.query_management_service.saveQuery(save_query_dto);
    }

    @Get("get-queries")
    async getQ() {
      return this.query_management_service.getQueries();
    }

}