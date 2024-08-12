import { Body, Controller, Post, Session, ValidationPipe } from '@nestjs/common';
import { NaturalLanguageService } from './natural-language.service';
import { Natural_Language_Query_Dto } from './dto/natural-language-query.dto';

@Controller('natural-language')
export class NaturalLanguageController {

    constructor(private readonly naturalLanguageService: NaturalLanguageService) {}

    @Post("query")
    async getSchemaMetadata(@Body(ValidationPipe) naturalLanguageQuery: Natural_Language_Query_Dto, @Session() session: Record<string, any>) {
        return this.naturalLanguageService.query(naturalLanguageQuery, session);
    }

}