import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Natural_Language_Query_Dto } from './dto/natural-language-query.dto';
import OpenAI from 'openai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Query, QueryParams } from '../interfaces/dto/query.dto';
import { DbMetadataHandlerService } from '../db-metadata-handler/db-metadata-handler.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class NaturalLanguageService {
  private openAiService: OpenAI;
  private geminiModel: GenerativeModel;

  constructor(
    @Inject('DbMetadataHandlerService') private readonly dbMetadataHandlerService: DbMetadataHandlerService,
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

  async open_ai_query(
    naturalLanguageQuery: Natural_Language_Query_Dto,
    session: Record<string, any>
  ) {
    try {
      //-----------Fetch DB metadata to inform the LLM of the database server's structure-----------//
      const metadataSummary =
        await this.dbMetadataHandlerService.getServerSummary(
          { 
            databaseServerID: naturalLanguageQuery.databaseServerID,
            language: naturalLanguageQuery.language 
          },
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

      const openAiResponse = await this.openAiService.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });

      const textResponse = openAiResponse.choices[0].message.content;

      //-------------------Sanitize the text response--------------------------//
      const cleanedTextResponse = textResponse
        .replace(/```/g, '') // Remove code block markers
        .replace(/(: |:)undefined/g, ': null'); // Replace undefined with null

      let jsonResponse;
      try {
        jsonResponse = await JSON.parse(cleanedTextResponse);
      } catch (error) {
        throw new BadRequestException({
          message: 'Invalid JSON format'
        });
      }

      await this.validate_QueryParams_DTO(jsonResponse);

      //--------------------Send the JSON intermediate form to the QueryHandler--------------------//

      const query: Query = {
        databaseServerID: naturalLanguageQuery.databaseServerID,
        queryParams: jsonResponse
      };

      await this.validate_Query_DTO(query);

      return { query: query };
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async gemini_query(
    naturalLanguageQuery: Natural_Language_Query_Dto,
    session: Record<string, any>
  ) {
    try {
      //-----------Fetch DB metadata to inform the LLM of the database server's structure-----------//
      const metadataSummary =
        await this.dbMetadataHandlerService.getServerSummary(
          { 
            databaseServerID: naturalLanguageQuery.databaseServerID,
            language: naturalLanguageQuery.language
          },
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

      prompt +=
        '\n\n Please do not use "*" to select all columns but instead use all the names for them. ';
      prompt += '\n\n For example: ';
      prompt += '\n\n DO NOT DO: ';
      prompt += `QueryParams = {
                    "language": "sql",
                    "query_type": "select",
                    "databaseName": "your_database_name",
                    "table": {
                        "name": "table_name",
                        "columns": [*]
                    }
                }`;
      prompt += '\n\n RATHER DO: ';
      prompt += `QueryParams = {
                      "language": "sql",
                      "query_type": "select",
                      "databaseName": "your_database_name",
                      "table": {
                          "name": "table_name",
                          "columns": [
                              {"name": "column1"},
                              {"name": "column2"},
                              {"name": "column3"},
                              {"name": "column4"}
                          ]
                      }
                  }`;

      prompt +=
        '\n\n Please ensure you always use the symbols for operators for example "=", "<" ect rather than using EQUAL ect...  ';

      prompt += '\n\n Here are a few examples of inputs and desired output: ';

      prompt += '\n\n Example 1: ';
      prompt += '\n\n Query: Give me country names starting with B ';
      prompt += `QueryParams = {
        "language": "sql",
        "query_type": "select",
        "databaseName": "sakila",
        "table": {
            "name": "country",
            "columns": [{"name": "country"}]
        },
        "condition": {
            "column": "country",
            "operator": "LIKE",
            "value": "B%"
        }`;

      prompt += '\n\n Example 2: ';
      prompt += '\n\n Query: Give me all the actors with the first name Nick ';
      prompt += `QueryParams = {
                    "language": "sql",
                    "query_type": "select",
                    "databaseName": "sakila",
                    "table": {
                        "name": "actor",
                        "columns": [
                            {"name": "first_name"},
                            {"name": "last_name"}
                        ]
                    },
                    "condition": {
                        "conditions": [
                            {
                                "tableName": "actor",
                                "column": "first_name",
                                "operator": "=",
                                "value": "Nick"
                            }
                        ],
                        "operator": "AND"
                    }
                }`;

      prompt += '\n\n Example 3: ';
      prompt +=
        '\n\n Query: Get me all the names of active staff members as well as their payment amounts and dates ';
      prompt += `QueryParams = {
                    "language": "sql",
                    "query_type": "select",
                    "databaseName": "sakila",
                    "table": {
                        "name": "staff",
                        "columns": [
                            {"name": "active"},
                            {"name": "first_name"},
                            {"name": "last_name"}
                        ],
                        "join": {
                            "table1MatchingColumnName": "staff_id",
                            "table2MatchingColumnName": "staff_id",
                            "table2": {
                                "name": "payment",
                                "columns": [
                                    {"name": "amount"},
                                    {"name": "payment_date"}
                                ]
                            }
                        }
                    }
                }`;

      prompt +=
        '\n\n Please ensure the following before returning a response: ';
      prompt +=
        '\n\n 1. The QueryParams should always have all the brackets, please ensure all starting brackets have ending brackets';

      prompt +=
        '\n\n Please think really hard of the given query and analyze the examples before giving me an output ';

      //--------------------Get the JSON intermediate form result from the LLM---------------------//

      const result = await this.geminiModel.generateContent(prompt);

      const response = await result.response;
      const textResponse = await response.text();

      //-------------------Sanitize the text response--------------------------//
      const cleanedTextResponse = textResponse
        .replace(/```/g, '') // Remove code block markers
        .replace(/(: |:)undefined/g, ': null') // Replace undefined with null
        .replace(/(\r\n|\n|\r)/gm, ''); // Remove newlines

      let jsonResponse;
      try {
        jsonResponse = await JSON.parse(cleanedTextResponse);
      } catch (error) {
        throw new BadRequestException({
          message: 'Invalid JSON format'
        });
      }

      await this.validate_QueryParams_DTO(jsonResponse);

      //--------------------Send the JSON intermediate form to the QueryHandler--------------------//

      const query: Query = {
        databaseServerID: naturalLanguageQuery.databaseServerID,
        queryParams: jsonResponse
      };

      await this.validate_Query_DTO(query);

      return { query: query };
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async validate_QueryParams_DTO(body: any) {
    const obj = plainToClass(QueryParams, body);

    await validate(obj).then((errors) => {
      if (errors.length > 0) {
        // throw new HttpException({ message: 'Validation failed', errors }, 400);
        throw new Error(`Validation failed: ${errors}`);
      } else {
        return { message: 'Validation passed' };
      }
    });

    return { message: 'Validation passed' };
  }

  async validate_Query_DTO(body: any) {
    const obj = plainToClass(Query, body);

    await validate(obj).then((errors) => {
      if (errors.length > 0) {
        // throw new HttpException({ message: 'Validation failed', errors }, 400);
        throw new Error(`Validation failed: ${errors}`);
      } else {
        return { message: 'Validation passed' };
      }
    });

    return { message: 'Validation passed' };
  }
}
