import { Injectable } from '@nestjs/common';
import { QueryParams } from '../interfaces/dto/query.dto';

@Injectable()
export abstract class JsonConverterService {
  abstract convertJsonToQuery(jsonData: QueryParams)
  abstract convertJsonToCountQuery(jsonData: QueryParams)
}
