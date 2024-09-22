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
  async getSchemaMetadata(
    @Body(ValidationPipe) naturalLanguageQuery: Natural_Language_Query_Dto,
    @Session() session: Record<string, any>
  ) {
    if (naturalLanguageQuery.llm === 'openAI') {
      const { query } = await this.naturalLanguageService.open_ai_query(
        naturalLanguageQuery,
        session
      );
      return query;
    } else if (naturalLanguageQuery.llm === 'gemini') {
      const { query } = await this.naturalLanguageService.gemini_query(
        naturalLanguageQuery,
        session
      );
      return query;
    } else {
      // I want to run both queries in parallel and return the resulting query if it is not malformed. The function will throw an error if there is something wrong with the query.

      let open_ai_result;
      let gemini_result;
      let errors = [];

      try {
        open_ai_result = await this.naturalLanguageService.open_ai_query(
          naturalLanguageQuery,
          session
        );
      } catch (error) {
        open_ai_result = { query: null };
        errors.push({ source: 'openAI', error: error.message });
      }

      try {
        gemini_result = await this.naturalLanguageService.gemini_query(
          naturalLanguageQuery,
          session
        );
      } catch (error) {
        gemini_result = { query: null };
        errors.push({ source: 'gemini', error: error.message });
      }

      if (open_ai_result.query && gemini_result.query) {
        // this.my_logger.log('Both queries returned a query');
        return gemini_result.query; // or gemini_result.query, based on your preference
      } else if (open_ai_result?.query) {
        // this.my_logger.log('Only openAI query returned a query');
        return open_ai_result.query;
      } else if (gemini_result?.query) {
        // this.my_logger.log('Only gemini query returned a query');
        return gemini_result.query;
      } else {
        throw new InternalServerErrorException(
          `Malformed query result. Errors: ${JSON.stringify(errors)}`
        );
      }
    }
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
