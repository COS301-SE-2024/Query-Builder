"use client"
import "../../app/globals.css"
import React, { useEffect, useState } from "react";
import {Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";

interface DatabaseCredentials {
  host: string,
  user: string,
  password: string
}

interface SortParams {
  column: string,
  direction?: "ascending"|"descending"
}

interface QueryParams {
  language: string,
  query_type: string,
  table: string,
  columns: string[],
  condition?: string,
  sortParams?: SortParams
}

interface Query {
credentials: DatabaseCredentials,
databaseName: string,
queryParams: QueryParams
}

interface Column {
  key: string,
  label: string
}

export interface TableResponseProps{

  query: Query

} 

export default function TableResponse(props: TableResponseProps){

  //dynamically create an array of column objects
  const columnNames = props.query.queryParams.columns;
  const columns: Column[] = [];
  for(const columnName of columnNames){
    columns.push({key: columnName, label: columnName});
  }


  console.log(columns);

  //A loading state that will initially be true and later false once data has been loaded
  const [loading, setLoading] = useState(true);

  //Create an async list that will hold the query response data upon load
  let tableData = useAsyncList({
    
    //function that loads the data asynchronously - an optional sortDescriptor can be passed in
    async load({sortDescriptor}){

      console.log("LOADING DATA");

      //the data is being loaded
      setLoading(true);

      //get the query from props
      let query: Query = props.query;

      //if we want to sort, add SortParams to the QueryParams
      if(sortDescriptor){
        query.queryParams.sortParams = {
          column: sortDescriptor.column+"",
          direction: sortDescriptor.direction
        }
      }

      //fetch the data from the endpoint
      let response = await fetch("http://localhost:55555/api/query", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(props.query)
      })

      let json = await response.json();
      setLoading(false);

      return {
        items: json
      };},

  });

    return (
      <Table 
        aria-label="Example table with dynamic content"
        sortDescriptor={tableData.sortDescriptor}
        onSortChange={tableData.sort}>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key} allowsSorting>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody 
        items={tableData.items}
        isLoading={loading}
        loadingContent={<Spinner label="Loading..." />}>
        {(item) => (
          //@ts-ignore
          <TableRow key={item.qbee_id}>
            {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>

    )

}