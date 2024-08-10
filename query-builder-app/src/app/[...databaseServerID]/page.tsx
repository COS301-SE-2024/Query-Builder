"use client"
import Form from "@/components/Form/Form";
import TableResponse from "@/components/TableResponse/TableResponse";
import {Tabs, Tab} from "@nextui-org/react";
import { useState } from "react";
import Sidebar from "../../components/SideBar/SideBar";
import NaturalLanguage from "@/components/NaturalLanguage/NaturalLanguage";


interface DatabaseCredentials {
  host: string,
  user: string,
  password: string
}

interface SortParams {
  column: string,
  direction?: "ascending" | "descending"
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

export default function QueryBuilder() {
  const [query, setQuery] = useState<Query | undefined>(undefined);

  return (
    <div className="full-application">
      <Sidebar />
      
      <div className="flex w-full flex-col center">
        <Tabs>
          <Tab key="form" title="QueryForm">
            <Form />
          </Tab>
          <Tab key="naturalLanguage" title="QueryQuill">
            <NaturalLanguage />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
