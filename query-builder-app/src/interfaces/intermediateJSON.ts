export interface Query {
    credentials?: DatabaseCredentials,
    databaseServerID: string,
    queryParams: QueryParams
}

export interface DatabaseCredentials {
    user: string,
    password: string
}

export interface QueryParams {
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
    id?: string
}

export interface primitiveCondition extends condition{
    value: string | number | boolean | QueryParams | null,
    tableName?: string,
    column: string,
    operator: ComparisonOperator,
    aggregate?: AggregateFunction,
    id?: string
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
    IS_NOT = "IS NOT",
    IN = "IN"
}