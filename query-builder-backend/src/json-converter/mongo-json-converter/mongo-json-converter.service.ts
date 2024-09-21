import { Injectable } from '@nestjs/common';
import { JsonConverterService } from '../json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';
import {
  primitiveCondition,
  compoundCondition,
  ComparisonOperator,
  condition
} from '../../interfaces/dto/conditions.dto';

@Injectable()
export class MongoJsonConverterService extends JsonConverterService {
  convertJsonToQuery(queryParams: QueryParams) {
    const query: any = {
      find: this.generateFindString(queryParams),
      filter: this.generateFilterObject(queryParams.condition),
      projection: this.generateProjectionObject(queryParams)
    };

    const sortObject = this.generateSortObject(queryParams);
    if (Object.keys(sortObject).length > 0) {
      query.sort = sortObject;
    }

    const skipValue = this.generateSkipInt(queryParams);
    if (skipValue > 0) {
      query.skip = skipValue;
    }

    const limitValue = this.generateLimitInt(queryParams);
    if (limitValue > 0) {
      query.limit = limitValue;
    }

    return query;
  }

  convertJsonToCountQuery(queryParams: QueryParams) {
    return { message: 'Not implemented' };
  }

  generateFindString(queryParams: QueryParams) {
    return queryParams.table.name;
  }

  generateFilterObject(condition: condition) {
    if (!condition) {
      return {};
    }

    if (this.isPrimitiveCondition(condition)) {
      const primCondition = condition as primitiveCondition;
      return {
        [primCondition.column]: {
          [this.sqlToMongoOperator(primCondition.operator)]: primCondition.value
        }
      };
    } else if (this.isCompoundCondition(condition)) {
      const compCondition = condition as compoundCondition;
      let conditions: object[] = [];
      for (let i = 0; i < compCondition.conditions.length; i++) {
        const cond = this.generateFilterObject(compCondition.conditions[i]);
        conditions.push(cond);
      }
      return { [compCondition.operator]: conditions };
    }
    return {};
  }

  generateSortObject(queryParams: QueryParams) {
    if (!queryParams.sortParams || !queryParams.sortParams.column) {
      return {};
    }

    // Ensure sort direction is either 1 (ascending) or -1 (descending)
    const direction =
      queryParams.sortParams.direction === 'descending' ? -1 : 1;
    return { [queryParams.sortParams.column]: direction };
  }

  generateProjectionObject(queryParams: QueryParams) {
    const projectionObject: Record<string, number> = {};

    for (const column of queryParams.table.columns) {
      projectionObject[column.name] = 1;
    }

    return projectionObject;
  }

  generateSkipInt(queryParams: QueryParams) {
    if (!queryParams.pageParams) {
      return 0;
    }

    const numPagesToSkip = queryParams.pageParams.pageNumber
      ? queryParams.pageParams.pageNumber - 1
      : 0;
    const numDocsToSkip =
      numPagesToSkip * (queryParams.pageParams.rowsPerPage || 0);

    return numDocsToSkip;
  }

  generateLimitInt(queryParams: QueryParams) {
    if (!queryParams.pageParams) {
      return 0;
    }

    return queryParams.pageParams.rowsPerPage || 0;
  }

  sqlToMongoOperator(sqlOperator: ComparisonOperator): string {
    switch (sqlOperator) {
      case '=':
        return '$eq';
      case '<':
        return '$lt';
      case '>':
        return '$gt';
      case '<=':
        return '$lte';
      case '>=':
        return '$gte';
      case '<>':
        return '$ne';
      case 'LIKE':
        return '$regex';
      case ComparisonOperator.EQUAL:
        return '$eq';
      case ComparisonOperator.LESS_THAN:
        return '$lt';
      case ComparisonOperator.GREATER_THAN:
        return '$gt';
      case ComparisonOperator.LESS_THAN_EQUAL:
        return '$lte';
      case ComparisonOperator.GREATER_THAN_EQUAL:
        return '$gte';
      case ComparisonOperator.NOT_EQUAL:
        return '$ne';
      case ComparisonOperator.LIKE:
        return '$regex';
      default:
        throw new Error(`Unsupported operator: ${sqlOperator}`);
    }
  }

  private isCompoundCondition(condition: any): condition is compoundCondition {
    return (condition as compoundCondition).conditions !== undefined;
  }

  private isPrimitiveCondition(
    condition: any
  ): condition is primitiveCondition {
    return (condition as primitiveCondition).column !== undefined;
  }
}
