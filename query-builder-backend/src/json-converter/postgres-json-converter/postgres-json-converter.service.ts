import { Injectable } from '@nestjs/common';
import { JsonConverterService } from '../json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';

@Injectable()
export class PostgresJsonConverterService extends JsonConverterService {

  convertJsonToQuery(jsonData: QueryParams) {
    return "Not yet implemented";
  }

  convertJsonToCountQuery(jsonData: QueryParams) {
    return "Not yet implemented";
  }

}