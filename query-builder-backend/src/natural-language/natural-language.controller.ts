import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  Put,
  Session,
  ValidationPipe
} from '@nestjs/common';
import { NaturalLanguageService } from './natural-language.service';
import { Natural_Language_Query_Dto } from './dto/natural-language-query.dto';
import { MyLoggerService } from '../my-logger/my-logger.service';

@Controller('natural-language')
export class NaturalLanguageController {
  constructor(
    private readonly naturalLanguageService: NaturalLanguageService,
    private readonly my_logger: MyLoggerService
  ) {
    this.my_logger.setContext(NaturalLanguageController.name);
  }

  @Post('query')
  async query(
    @Body(ValidationPipe) naturalLanguageQuery: Natural_Language_Query_Dto,
    @Session() session: Record<string, any>
  ) {
    return this.naturalLanguageService.naturalLanguageQuery(naturalLanguageQuery, session);
  }

  @Put('validate-query-dto')
  async validateQueryDTO(@Body(ValidationPipe) body: any) {
    return this.naturalLanguageService.validate_Query_DTO(body);
  }

  @Put('validate-query-params-dto')
  async validateQueryParamsDTO(@Body(ValidationPipe) body: any) {
    return this.naturalLanguageService.validate_QueryParams_DTO(body);
  }
}
