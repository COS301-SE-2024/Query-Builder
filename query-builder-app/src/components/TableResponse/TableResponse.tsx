"use client"
import "../../app/globals.css"
import React, { useEffect, useState } from "react";
import {Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner, Pagination, Button, useDisclosure, Modal, ModalContent, ModalHeader} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";
import Report from "../Report/Report";

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

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = () => {
  const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  const token = sessionData?.access_token;

  return token;
};

export default function TableResponse(props: TableResponseProps){

  //dynamically create an array of column objects from the props
  const columnNames = props.query.queryParams.columns;
  const columns: Column[] = [];
  for(const columnName of columnNames){
    columns.push({key: columnName, label: columnName});
  }

  //React hook for report modal
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  //A page state holding the page number of the query data that we are currently viewing
  const [pageNumber, setPageNumber] = useState(1);

  //A state holding the number of rows of query data that we would like to view per page (default = 20)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  //A state holding the total number of pages that the data can fill
  const [totalPages, setTotalPages] = useState(1);

  //A loading state that will initially be true and later false once data has been loaded
  const [loading, setLoading] = useState(true);

  //Create an async list that will hold the query response data upon load
  let tableData = useAsyncList({
    
    //function that loads the data asynchronously - an optional sortDescriptor can be passed in
    async load({sortDescriptor}){

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
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
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
              {(columnKey) => <TableCell>{typeof getKeyValue(item, columnKey) === 'object' ? JSON.stringify(getKeyValue(item, columnKey)) :  getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex w-full justify-between" style={{position: "absolute", bottom: "0", backgroundColor: "white", padding:"30px"}}>
        <div className="flex w-full justify-center">
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
              setPageNumber(pageNumber);
            }}
          />
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              defaultValue={20}
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
        <div></div>
        <Button color="primary" className="mx-1">Export Data</Button>
        <Button onPress={onOpen} color="primary" className="mx-1">Generate Report</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black h-100vh"
          size="full">
          <ModalContent>
              {(onClose : any) => (
                  <>
                      <ModalHeader className="flex flex-col gap-1">Query Report</ModalHeader>
                      <Report query={props.query}></Report>
                  </>
              )}
          </ModalContent>
        </Modal>
      </div>
    </div>

    )

}