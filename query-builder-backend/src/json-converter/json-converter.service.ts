import { Injectable } from '@nestjs/common';
import { QueryParams } from '../interfaces/dto/query.dto';

@Injectable()
export class JsonConverterService {
  convertJsonToQuery(jsonData: QueryParams) {
    return
  }
}
