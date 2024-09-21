import { Body, Controller, HttpCode, Post, Session } from '@nestjs/common';
import { QueryHandlerService } from './query-handler.service';
import { Query } from '../interfaces/dto/query.dto';

@Controller('query')
export class QueryHandlerController {
  constructor(private readonly queryHandlerService: QueryHandlerService) {}

  //end point to execute a query on a selected database
  @HttpCode(200)
  @Post()
  async query(@Body() query: Query, @Session() session: Record<string, any>) {
    return this.queryHandlerService.queryDatabase(query, session);
  }
}
