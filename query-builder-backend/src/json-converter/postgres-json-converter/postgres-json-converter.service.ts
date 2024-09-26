import { Injectable } from '@nestjs/common';
import { JsonConverterService } from '../json-converter.service';
import {
  condition,
  compoundCondition,
  primitiveCondition
} from '../../interfaces/dto/conditions.dto';
import { QueryParams } from '../../interfaces/dto/query.dto';
import { table, column } from '../../interfaces/dto/table.dto';

interface PreparedStatement {
  queryString: string,
  parameters: any[]
}

@Injectable()
export class PostgresJsonConverterService extends JsonConverterService {

  //function to convert an entire QueryParams object into a query string
  public convertJsonToQuery(jsonData: QueryParams): PreparedStatement {
    let query = '';
    let params = [];
    jsonData.language = jsonData.language.toLowerCase();
    jsonData.query_type = jsonData.query_type.toLowerCase();

    if (jsonData.language === 'postgresql') {
      if (jsonData.query_type === 'select') {
        if (
          !jsonData.table ||
          !jsonData.table.name ||
          !jsonData.table.columns
        ) {
          throw new Error('Invalid query');
        }

        const select = this.generateSelectClause(jsonData);

        const from = this.generateFromClause(jsonData);

        const wherePreparedStatement = this.conditionWhereSQL(jsonData.condition);
        const where = wherePreparedStatement.queryString;
        params = params.concat(wherePreparedStatement.parameters);

        const groupBy = this.groupBySQL(jsonData);

        const havingPreparedStatement = this.havingSQL(jsonData);
        const having = havingPreparedStatement.queryString;
        params = params.concat(havingPreparedStatement.parameters);

        const orderBy = this.generateOrderByClause(jsonData);

        const limit = this.generateLimitClause(jsonData);

        query = `SELECT ${select} FROM ${from}${where}${groupBy}${having}${orderBy}${limit}`;
        query = this.replaceQbeeParameters(query);

      } else {
        throw new Error('Unsupported query type');
      }
    } else {
      throw new Error('Invalid language');
    }

    return {queryString: query, parameters: params};
  }

  //function that generates a query that counts the number of rows the query would return without pagination
  public convertJsonToCountQuery(jsonData: QueryParams): PreparedStatement {
    let query = '';
    let params = [];
    jsonData.language = jsonData.language.toLowerCase();
    jsonData.query_type = jsonData.query_type.toLowerCase();

    if (jsonData.language === 'postgresql') {
      if (jsonData.query_type === 'select') {
        if (
          !jsonData.table ||
          !jsonData.table.name ||
          !jsonData.table.columns
        ) {
          throw new Error('Invalid query');
        }

        //Make the original query, without pagination and ordering, a subquery
        //then count the number of rows it returns

        //Include a select clause as aggregates can affect the number of rows
        const select = this.generateSelectClause(jsonData);

        //Include a from clause as joins can affect the number of rows
        const from = this.generateFromClause(jsonData);

        //Include a where clause as filters can affect the number of rows
        const wherePreparedStatement = this.conditionWhereSQL(jsonData.condition);
        const where = wherePreparedStatement.queryString;
        params = params.concat(wherePreparedStatement.parameters);

        //Include a group by clause as aggregates can affect the number of rows
        const groupBy = this.groupBySQL(jsonData);

        //Include a having clause as filters can affect the number of rows
        const havingPreparedStatement = this.havingSQL(jsonData);
        const having = havingPreparedStatement.queryString;
        params = params.concat(havingPreparedStatement.parameters);

        //Exclude an orderBy clause sorting doesn't affect the total number of rows

        //Exclude a limit clause as we want to ignore pagination

        query = `SELECT COUNT(*) AS numRows FROM (SELECT ${select} FROM ${from}${where}${groupBy}${having}) AS subquery`;
        query = this.replaceQbeeParameters(query);

      } else {
        throw new Error('Unsupported query type');
      }
    } else {
      throw new Error('Invalid language');
    }

    return {queryString: query, parameters: params};
  }

  //helper function that replaces all ?QbeeParameter?'s with numbered Postgres parameters
  private replaceQbeeParameters(queryString: string): string{

    let parameterNumber: number = 1;
    let allReplaced: boolean = false;

    while(!allReplaced){
      let newQueryString: string = queryString.replace("?QbeeParameter?", "$" + parameterNumber);
      allReplaced = (newQueryString === queryString);
      queryString = newQueryString;
      parameterNumber++;
    }

    return queryString;

  }

  //helper function to generate a string of a column
  private generateColumnString(column: column, tableName: string): string {
    let columnString = '';

    if (column.aggregation) {
      columnString += column.aggregation + '(';
    }

    columnString += '"' + tableName + '"."' + column.name + '"';

    if (column.aggregation) {
      columnString += ')';
      //give a custom alias if one is not provided
      if(!column.alias){
        columnString += ' AS "' + column.aggregation + '(' + column.name + ')"';
      }
    }

    if (column.alias) {
      columnString += ' AS "' + column.alias + '"';
    }

    return columnString;
  }

  //helper function to generate string of all the columns to be returned from a table
  private generateListOfColumns(table: table): string {
    let tableColumns = '';

    //don't need to select columns from every table in the case of joins
    //the below was changed to throw an error - as not specifying any columns at all causes issues when figuring out which columns to group by when working with aggregate conditions
    //if the columns array is empty return all the columns for the table
    //tableColumns = '`' + table.name + '`.' + '*';
    //throw new Error('No columns specified for table \'' + table.name + '\'');
    //otherwise concatenate the column strings together
    //first add tick symbols around each column name to deal with names with spaces
    for (
      let columnIndex = 0;
      columnIndex < table.columns.length - 1;
      columnIndex++
    ) {
      tableColumns +=
        this.generateColumnString(table.columns[columnIndex], table.name) +
        ', ';
    }
    tableColumns += this.generateColumnString(
      table.columns[table.columns.length - 1],
      table.name
    );

    return tableColumns;
  }

  private generateSelectClause(queryParams: QueryParams): string {
    let selectClause = '';

    //get a reference to the first table
    let tableRef = queryParams.table;

    //concatenate the first table's columns
    if (tableRef.columns.length > 0) {
      selectClause += this.generateListOfColumns(tableRef);
    }

    //traverse the table linked list and add columns for each table until tableRef.join is null
    while (tableRef.join) {
      //move the table reference one on
      tableRef = tableRef.join.table2;

      if (tableRef.columns.length > 0) {
        selectClause += ', ' + this.generateListOfColumns(tableRef);
      }
    }

    return selectClause;
  }

  private generateFromClause(queryParams: QueryParams): string {
    let fromClause = '';

    //get a reference to the first table
    let tableRef = queryParams.table;

    //concatenate the first table
    fromClause += '"' + tableRef.name + '"';

    //traverse the table linked list and add each join until tableRef.join is null
    while (tableRef.join) {
      //get the join
      const join = tableRef.join;

      fromClause +=
        ' JOIN "' +
        join.table2.name +
        '" ON "' +
        tableRef.name +
        '"."' +
        join.table1MatchingColumnName +
        '"="' +
        join.table2.name +
        '"."' +
        join.table2MatchingColumnName +
        '"';

      //move the table reference one on
      tableRef = tableRef.join.table2;
    }

    return fromClause;
  }

  private generateOrderByClause(queryParams: QueryParams): string {
    let orderBy = '';

    if (queryParams.sortParams) {
      let sortDirection = '';

      //SQL specific mapping of directions
      if (queryParams.sortParams.direction == 'descending') {
        sortDirection = 'DESC';
      }
      //defaults to ascending sorting
      else {
        sortDirection = 'ASC';
      }

      orderBy =
        ' ORDER BY "' + queryParams.sortParams.column + '" ' + sortDirection;
    }

    return orderBy;
  }

  private generateLimitClause(queryParams: QueryParams): string {
    let limit = '';

    if (queryParams.pageParams) {
      //get the page number and number of rows of data per page that we would like to return
      const rowsPerPage = queryParams.pageParams.rowsPerPage;
      const pageNumber = queryParams.pageParams.pageNumber;

      //calculate the offset into the data where we should start returning data
      //in SQL rows are indexed from 1 and the OFFSET is one less than the first row we want to return
      const offset = (pageNumber - 1) * rowsPerPage;

      limit = ` LIMIT ${rowsPerPage} OFFSET ${offset}`;
    }

    return limit;
  }

  private isCompoundCondition(condition: any): condition is compoundCondition {
    return (condition as compoundCondition).conditions !== undefined;
  }

  private isPrimitiveCondition(
    condition: any
  ): condition is primitiveCondition {
    return (condition as primitiveCondition).column !== undefined;
  }

  private conditionWhereSQLHelp(condition: condition): PreparedStatement {
    if (!condition) {
      return {queryString:'', parameters:[]};
    }

    if (this.isCompoundCondition(condition)) {
      const compCondition = condition as compoundCondition;
      let conditionsSQL = '';
      let params = [];

      for (let i = 0; i < compCondition.conditions.length; i++) {
        const condSQL = this.conditionWhereSQLHelp(compCondition.conditions[i]);
        conditionsSQL += condSQL.queryString;
        params = params.concat(condSQL.parameters);
        if (i < compCondition.conditions.length - 1) {
          conditionsSQL += ` ${compCondition.operator} `;
        }
      }

      return {queryString: `(${conditionsSQL})`, parameters: params};

    } else if (this.isPrimitiveCondition(condition)) {

      const primCondition = condition as primitiveCondition;

      let sql = '';
      let params = [];

      if (primCondition.tableName) {
        sql += `"${primCondition.tableName}".`;
      }

      sql += `"${primCondition.column}" ${primCondition.operator} `;

      if(primCondition.value == null){
        sql += 'NULL';
      }
      else if (typeof primCondition.value === 'string' || typeof primCondition.value === 'boolean' || typeof primCondition.value === 'number') {
        sql += `?QbeeParameter?`;
        params.push(primCondition.value)
      } else if (typeof primCondition.value === 'object') {
        sql += `(${this.convertJsonToQuery(primCondition.value)})`;
      }

      return {queryString: sql, parameters: params};

    }
  }

  private conditionWhereSQL(condition: condition): PreparedStatement {
    if (!condition) {
      return {queryString: '', parameters: []};
    }

    if (this.isPrimitiveCondition(condition)) {
      const primCondition = condition as primitiveCondition;
      if (primCondition.aggregate != null) {
        return {queryString: '', parameters: []};
      }
    }

    const preparedStatement: PreparedStatement = this.conditionWhereSQLHelp(condition);
    return {queryString: ' WHERE ' + preparedStatement.queryString, parameters: preparedStatement.parameters};
  }

  private generateNonAggregateColumnsString(table: table): string {
    let nonAggregateColumnsString = '';

    // Iterate through the columns of the table and include only those without aggregation functions
    for (const column of table.columns) {
      if (column.aggregation == null) {
        // Ensure column names are properly formatted for SQL
        nonAggregateColumnsString += `"${table.name}"."${column.name}", `;
      }
    }

    return nonAggregateColumnsString;
  }

  private isThereAggregates(jsonData: QueryParams): boolean {
    let tableRef = jsonData.table;

    for (const column of tableRef.columns) {
      if (column.aggregation) {
        return true;
      }
    }
    while (tableRef.join) {
      tableRef = tableRef.join.table2;

      for (const column of tableRef.columns) {
        if (column.aggregation) {
          return true;
        }
      }
    }

    return false;
  }

  private groupBySQL(jsonData: QueryParams) {
    let groupByColumns = '';

    // Iterate over all tables
    if (this.isThereAggregates(jsonData) == false) {
      return '';
    }

    //get a reference to the first table
    let tableRef = jsonData.table;

    //concatenate the first table's columns
    groupByColumns += this.generateNonAggregateColumnsString(tableRef);

    //traverse the table linked list and add columns for each table until tableRef.join is null
    while (tableRef.join) {
      //move the table reference one on
      tableRef = tableRef.join.table2;

      groupByColumns += this.generateNonAggregateColumnsString(tableRef);
    }

    // Remove the trailing comma and space
    if (groupByColumns) {
      groupByColumns = groupByColumns.slice(0, -2); // Remove last comma and space
      return ` GROUP BY ${groupByColumns}`;
    } else {
      return '';
    }
  }

  private getAggregateConditions(condition: condition): PreparedStatement[] {
    let aggregateConditions: PreparedStatement[] = [];

    if (this.isCompoundCondition(condition)) {
      const compCondition = condition as compoundCondition;

      for (let i = 0; i < compCondition.conditions.length; i++) {
        aggregateConditions = aggregateConditions.concat(this.getAggregateConditions(compCondition.conditions[i]));
      }
    } else if (this.isPrimitiveCondition(condition) && condition.aggregate) {
      const primCondition = condition as primitiveCondition;
      let sql = '';
      let params = [];

      if (condition.tableName) {
        sql = `${primCondition.aggregate}("${condition.tableName}"."${primCondition.column}") ${primCondition.operator} `;
      } else {
        sql = `${primCondition.aggregate}("${primCondition.column}") ${primCondition.operator} `;
      }

      if(primCondition.value == null){
        sql += 'NULL';
      }
      else if (typeof primCondition.value === 'string' || typeof primCondition.value === 'boolean' || typeof primCondition.value === 'number') {
        sql += `?QbeeParameter?`;
        params.push(primCondition.value)
      } else if (typeof primCondition.value === 'object') {
        sql += `(${this.convertJsonToQuery(primCondition.value)})`;
      }

      aggregateConditions.push({queryString: sql, parameters: params});
    }

    return aggregateConditions;
  }

  private havingSQL(jsonData: QueryParams): PreparedStatement {
    if (!jsonData.condition) {
      return {queryString: '', parameters: []};
    }

    const havingConditions = this.getAggregateConditions(jsonData.condition);

    if(havingConditions.length < 1){
      return {queryString: '', parameters: []};
    }
    else{
      let qString = ' HAVING ';
      let params = [];
  
      for(let i = 0; i < havingConditions.length-1; i++){
          qString += havingConditions[i].queryString + " AND ";
          params = params.concat(havingConditions[i].parameters);
      }
      qString += havingConditions[havingConditions.length-1].queryString;
      params = params.concat(havingConditions[havingConditions.length-1].parameters);
      return {queryString: qString, parameters: params}
    }
    
  }

}
