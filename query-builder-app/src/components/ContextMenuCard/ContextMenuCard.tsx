import React from "react";
import { Card, CardBody, CardFooter, Divider, CardHeader, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";

export interface Query {
    credentials: DatabaseCredentials,
    databaseServerID?: string,
    queryParams: QueryParams
}

export interface DatabaseCredentials {
    host: string,
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
    aggregation?: AggregateFunction,
    alias?: string,
}

export interface join {
    table1MatchingColumnName: string,
    table2: table,
    table2MatchingColumnName: string,
}

export interface condition {
}

export interface compoundCondition extends condition {
    conditions: condition[],
    operator: LogicalOperator,
}

export interface primitiveCondition extends condition {
    value: string | number | boolean | null,
    tableName?: string,
    column: string,
    operator: ComparisonOperator,
    aggregate?: AggregateFunction
}

export interface SortParams {
    column: string,
    direction?: "ascending" | "descending"
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
}

export interface ContextMenuCardProps {
    title: string,
    date: string,
    query: any
}

export default function ContextMenuCard({ title, date, query }: ContextMenuCardProps) {
    return (

        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="flat" className="w-[275px]" color="primary"
                >
                    {title}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
                <DropdownSection title={date}>
                    <DropdownItem key="retrieve" description="Retrieve saved query">Retrieve Query</DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger" description="Delete query from saved queries">Delete Query</DropdownItem>
                </DropdownSection>

            </DropdownMenu>
        </Dropdown>
    );
}
