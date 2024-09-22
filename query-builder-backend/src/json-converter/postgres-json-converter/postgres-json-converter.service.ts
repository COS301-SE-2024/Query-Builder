import { Injectable } from '@nestjs/common';
import { JsonConverterService } from '../json-converter.service';
import { QueryParams } from '../../interfaces/dto/query.dto';

@Injectable()
export class PostgresJsonConverterService extends JsonConverterService {
  convertJsonToQuery(jsonData: QueryParams) {
    let query = '';
    jsonData.language = jsonData.language.toLowerCase();
    jsonData.query_type = jsonData.query_type.toLowerCase();

    if (jsonData.language === 'postgres') {
      if (jsonData.query_type === 'select') {
        if (
          !jsonData.table ||
          !jsonData.table.name ||
          !jsonData.table.columns ||
          jsonData.table.columns.length === 0
        ) {
          throw new Error('Invalid query');
        }

        const select = this.generateSelectClausePost(jsonData);

        const from = this.generateFromClausePost(jsonData);

        const where = this.conditionWhereSQLPost(jsonData.condition);

        const groupBy = this.groupBySQLPost(jsonData);

        query = `SELECT ${select} FROM ${from}${where}${groupBy}`;
      } else {
        throw new Error('Unsupported query type');
      }
    } else {
      throw new Error('Invalid language');
    }

    return query;
  }

  convertJsonToCountQuery(jsonData: QueryParams) {
    return { message: 'Not implemented' };
  }

  generateSelectClausePost(jsonData) {
    if (!jsonData.table || !jsonData.table.columns) {
      return '*';
    }

    return jsonData.table.columns
      .map((col) => {
        const columnName = typeof col === 'object' && col.name ? col.name : col;
        return `"${columnName}"`;
      })
      .join(', ');
  }

  generateFromClausePost(jsonData) {
    const tableName = jsonData.table.name;
    return `"${tableName}"`;
  }

  conditionWhereSQLPost(condition) {
    if (
      !condition ||
      !condition.column ||
      !condition.operator ||
      condition.value === undefined
    )
      return '';

    const column = `"${condition.column}"`;
    const operator = condition.operator.toUpperCase();
    const value =
      typeof condition.value === 'string'
        ? `'${condition.value.replace(/'/g, "''")}'`
        : condition.value; // Handle single quotes in strings

    return ` WHERE ${column} ${operator} ${value}`;
  }

  groupBySQLPost(jsonData) {
    if (!jsonData.groupBy || jsonData.groupBy.length === 0) return '';

    return ` GROUP BY ${jsonData.groupBy.map((col) => `"${col}"`).join(', ')}`;
  }
}
