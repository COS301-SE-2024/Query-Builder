"use client"
import "../../app/globals.css"
import React, { useEffect, useState } from "react";
import {Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, Pagination} from "@nextui-org/react";
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

interface Column {
  key: string,
  label: string
}

export interface TableResponseProps{

  query: Query

} 

export default function TableResponse(props: TableResponseProps){

  //dynamically create an array of column objects from the props
  const columnNames = props.query.queryParams.columns;
  const columns: Column[] = [];
  for(const columnName of columnNames){
    columns.push({key: columnName, label: columnName});
  }

  console.log(columns);

  //A page state holding the page number of the query data that we are currently viewing
  const [pageNumber, setPageNumber] = useState(1);

  //A state holding the number of rows of query data that we would like to view per page (default = 10)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  //A state holding the total number of pages that the data can fill
  const [totalPages, setTotalPages] = useState(1);

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

      //add PageParams to the QueryParams
      query.queryParams.pageParams = {
        pageNumber: pageNumber,
        rowsPerPage: rowsPerPage
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

      //set totalNumberOfPages
      const totalNumberOfRows = json.totalNumRows;
      const totalNumberOfPages = Math.ceil(totalNumberOfRows/rowsPerPage);
      setTotalPages(totalNumberOfPages);

      return {
        items: json.data
      };},

  });

  //reload the tableData after updating pageNumber
  useEffect(() => {
    tableData.reload();
  }, [pageNumber, rowsPerPage]);

    return (
      <div style={{overflow: "scroll", maxHeight: "80vh", overflowX: "hidden"}}>
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

      <div className="flex w-full justify-center" style={{position: "absolute", bottom: "0", backgroundColor: "white", padding:"30px"}}>
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={pageNumber}
          total={totalPages}
          variant="light"
          onChange={(pageNumber)=>{
            console.log("PAGE NUMBER: " + pageNumber);
            setPageNumber(pageNumber);
          }}
        />
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={(rowsPerPage)=>{
              setRowsPerPage(Number(rowsPerPage.target.value));
              setPageNumber(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
          </select>
        </label>
      </div>
    </div>

    )

}