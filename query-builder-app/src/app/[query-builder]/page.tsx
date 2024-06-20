"use client"
import Form from "@/components/Form/Form";
import TableResponse from "@/components/TableResponse/TableResponse";
import { useState } from "react";

interface DatabaseCredentials {
    host: string,
    user: string,
    password: string
  }
  
  interface SortParams {
    column: string,
    direction?: "ascending"|"descending"
  }
  
  interface PageParams {
    pageNumber: number,
    rowsPerPage: number
  }
  
  interface QueryParams {
    language: string,
    query_type: string,
    table: string,
    columns: string[],
    condition?: string,
    sortParams?: SortParams,
    pageParams?: PageParams
  }
  
  interface Query {
  credentials: DatabaseCredentials,
  databaseName: string,
  queryParams: QueryParams
  }

export default async function QueryBuilder() {
    const [query, setQuery] = useState<Query | undefined>(undefined);

    if(query === undefined)
        {
            return <>
                <Form />
            </>;
        }
        else
        {
            return <>
                <Form />
                <TableResponse query={query} />
            </>;
        }
}
