import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Put,
  Session,
  ValidationPipe
} from '@nestjs/common';
import { NaturalLanguageService } from './natural-language.service';
import { Natural_Language_Query_Dto } from './dto/natural-language-query.dto';
import { query } from 'express';

@Controller('natural-language')
export class NaturalLanguageController {
  constructor(
    private readonly naturalLanguageService: NaturalLanguageService
  ) {}

  @Post('query')
  async getSchemaMetadata(
    @Body(ValidationPipe) naturalLanguageQuery: Natural_Language_Query_Dto,
    @Session() session: Record<string, any>
  ) {
    if (naturalLanguageQuery.llm === 'openAI') {
      return this.naturalLanguageService.open_ai_query(
        naturalLanguageQuery,
        session
      );
    } else if (naturalLanguageQuery.llm === 'gemini') {
      return this.naturalLanguageService.gemini_query(
        naturalLanguageQuery,
        session
      );
    } else {
      // I want to run both queries in parallel and return the resulting query if it is not malformed. The function will throw an error if there is something wrong with the query.
      const open_ai_call = this.naturalLanguageService.open_ai_query(
        naturalLanguageQuery,
        session
      );

      const gemini_call = this.naturalLanguageService.gemini_query(
        naturalLanguageQuery,
        session
      );

      let open_ai_result;
      let gemini_result;
      let errors = [];

      try {
        console.log('Awaiting openAI call');
        open_ai_result = await Promise.resolve(open_ai_call);
        console.log('openAI call completed');
      } catch (error: any) {
        console.log('Error in openAI call'); 
        open_ai_result = { query: null };
        errors.push({ source: 'openAI', error: error.message });
        console.log('Error in openAI call after push' + JSON.stringify(errors));
      }

      try {
        console.log('Awaiting gemini call');
        gemini_result = await Promise.resolve(gemini_call);
        console.log('gemini call completed');
      } catch (error: any) {
        console.log('Error in gemini call');
        gemini_result = { query: null };
        errors.push({ source: 'gemini', error: error.message });
        console.log('Error in gemini call after push' + JSON.stringify(errors));
      }

      if (open_ai_result.query && gemini_result.query) {
        console.log('Both queries returned a query');
        return open_ai_result.query; // or gemini_result.query, based on your preference
      } else if (open_ai_result?.query) {
        console.log('Only openAI query returned a query');
        return open_ai_result.query;
      } else if (gemini_result?.query) {
        console.log('Only gemini query returned a query');
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
