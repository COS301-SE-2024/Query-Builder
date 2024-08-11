import { Injectable } from '@nestjs/common';
import { Natural_Language_Query_Dto } from './dto/natural-language-query.dto';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Query } from '../interfaces/intermediateJSON';
import { DbMetadataHandlerService } from '../db-metadata-handler/db-metadata-handler.service';

@Injectable()
export class NaturalLanguageService {
  private openAiService: OpenAI;
  private geminiModel: GenerativeModel;

  constructor(
    private readonly dbMetadataHandlerService: DbMetadataHandlerService,
    private configService: ConfigService
  ) {
    // Inject the OpenAIApi instance
    // Initialize OpenAIApi with the provided API key from the environment
    this.openAiService = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    //Initialise the Gemini instance
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async query(
    naturalLanguageQuery: Natural_Language_Query_Dto,
    session: Record<string, any>
  ) {
    if (naturalLanguageQuery.llm === 'openAI') {
      const openAiResponse = this.openAiService.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: naturalLanguageQuery.query }]
      });

      return openAiResponse;

      //--------------------Send the JSON intermediate form to the QueryHandler--------------------//
    } else {
      //-----------Fetch DB metadata to inform the LLM of the database server's structure-----------//
      const metadataSummary =
        await this.dbMetadataHandlerService.getSchemaSummary(
          { databaseServerID: naturalLanguageQuery.databaseServerID },
          session
        );
      const metadataSummaryString = JSON.stringify(metadataSummary);

      //-------------------------------Create the prompt for the LLM-------------------------------//

      let prompt: string =
        'Given the following QueryParams interface, write a QueryParams object for the natural language query ' +
        naturalLanguageQuery.query +
        '\n\n';

      prompt +=
        'Return only the object not in a code block without any comments or other text. Language should be sql and query type should be select \n\n';

      prompt += `export interface QueryParams {
                            language: string,
                            query_type: string,
                            databaseName: string,
                            table: table,
                            condition?: condition,
                            sortParams?: SortParams,
                            pageParams?: PageParams
                        }

                        export interface table {
                            name: string,
                            columns: column[],
                            join?: join
                        }

                        export interface column {
                            name: string,
                            aggregation? : AggregateFunction,
                            alias?: string,
                        }

                        export interface join {
                            table1MatchingColumnName: string,
                            table2: table,
                            table2MatchingColumnName: string,
                        }

                        export interface condition {
                        }

                        export interface compoundCondition extends condition{
                            conditions: condition[],
                            operator: LogicalOperator,
                        }

                        export interface primitiveCondition extends condition{
                            value: string | number | boolean | null,
                            tableName?: string,
                            column: string,
                            operator: ComparisonOperator,
                            aggregate?: AggregateFunction
                        }

                        export interface SortParams {
                            column: string,
                            direction?: "ascending"|"descending"
                        }

                        export interface PageParams {
                            //note pageNumbers are indexed from 1
                            pageNumber: number,
                            rowsPerPage: number
                        }

                        export enum AggregateFunction {
                            COUNT = "COUNT",
                            SUM = "SUM",
                            AVG = "AVG",
                            MIN = "MIN",
                            MAX = "MAX",
                        }

                        export enum LogicalOperator {
                            AND = "AND",
                            OR = "OR",
                            NOT = "NOT",
                        }

                        export enum ComparisonOperator {
                            EQUAL = "=",
                            LESS_THAN = "<",
                            GREATER_THAN = ">",
                            LESS_THAN_EQUAL = "<=",
                            GREATER_THAN_EQUAL = ">=",
                            NOT_EQUAL = "<>",
                            LIKE = "LIKE",
                            IS = "IS",
                            IS_NOT = "IS NOT"
                        }`;

      prompt +=
        '\n\n The database structure is as follows: ' + metadataSummaryString;

      //--------------------Get the JSON intermediate form result from the LLM---------------------//

      const result = await this.geminiModel.generateContent(prompt);

      const response = await result.response;
      const textResponse = response.text();

      console.log(textResponse);

      //-------------------Do some potential cleanup of the text response--------------------------//
      const cleanedTextResponse = textResponse.replaceAll(
        /(: |:)undefined/g,
        ': null'
      );
      console.log(cleanedTextResponse);

      const jsonResponse = JSON.parse(cleanedTextResponse);

      //--------------------Send the JSON intermediate form to the QueryHandler--------------------//

      const query: Query = {
        databaseServerID: naturalLanguageQuery.databaseServerID,
        queryParams: jsonResponse
      };

      return query;
    }
  }
}
