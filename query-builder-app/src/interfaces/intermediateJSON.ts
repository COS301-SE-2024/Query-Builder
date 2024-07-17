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

interface join {
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
}