"use client"
import Form from "@/components/Form/Form";
import TableResponse from "@/components/TableResponse/TableResponse";
import {Tabs, Tab, Card} from "@nextui-org/react";
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
    
      <Card style={{ borderRadius: '0', boxShadow: 'none', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Tabs 
        aria-label="Tabs" 
        color="primary" 
        variant="underlined"
        classNames={{
          tabList: "w-full flex border-b border-divider p-0",
          tab: "flex-1 text-center py-2",
          tabContent: "p-4"
        }}
      >
        <Tab 
          key="form" 
          title="QueryForm"
          className="flex-1"
        >
          <div style={{ width: '100%' }}>
            <Form />
          </div>
        </Tab>
        <Tab 
          key="naturalLanguage" 
          title="QueryQuill"
          className="flex-1"
        >
          <div style={{ width: '100%' }}>
            <NaturalLanguage />
          </div>
        </Tab>
      </Tabs>
    </Card>
    </div>
  );
}
