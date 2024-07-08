interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
  }

  interface PageParams {
    //note pageNumbers are indexed from 1
    pageNumber: number,
    rowsPerPage: number
}

export interface QueryParams {
    language: string,
    query_type: string,
    table: table,
    join?: join[],
    condition?: condition,
    sortParams?: SortParams,
    pageParams?: PageParams
}

interface table {
    name: string,
    columns: column[],
}

interface column {
    name: string,
    aggregation? : AggregateFunction,
    alias?: string,
}

interface join {
    table1: table,
    table1MatchingColumnName: string,
    table2: table,
    table2MatchingColumnName: string,
}

interface condition {
}

interface compoundCondition extends condition{
    conditions: condition[],
    operator: LogicalOperator,
}

interface primitiveCondition extends condition{
    value: string | number | boolean,
    column: string,
    operator: ComparisonOperator,
    aggregate?: AggregateFunction
}

export enum AggregateFunction {
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
}

export enum LogicalOperator {
    "AND",
    "OR",
    "NOT",
}

export enum ComparisonOperator {
    "=",
    "<",
    ">",
    "<=",
    ">=",
    "<>",
    "LIKE",
}