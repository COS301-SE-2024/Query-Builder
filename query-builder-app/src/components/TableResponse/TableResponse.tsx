'use client';
import '../../app/globals.css';
import React,{ useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Pagination,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import { useAsyncList } from '@react-stately/data';
import Report from '../Report/Report';
import csvDownload from 'json-to-csv-export';
import { Query } from '@/interfaces/intermediateJSON';
import { createClient } from './../../utils/supabase/client';
import SaveQueryModal from '../SaveQueryModal/SaveQueryModal';
import { Metadata } from '../Report/Report';
import { navigateToAuth } from '../../app/authentication/actions';
import toast, { Toaster } from 'react-hot-toast';

interface Column {
  key: string;
  label: string;
}

export interface TableResponseProps {
  query: Query;
  metadata: Metadata;
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {
  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  return token;
};

export default function TableResponse(props: TableResponseProps) {
  let tableRef = props.query.queryParams.table;

  //dynamically create an array of column objects from the props
  let columnObjects = tableRef.columns;

  //traverse the joined tables linked list and add all column objects
  while (tableRef.join != null) {
    tableRef = tableRef.join.table2;
    columnObjects = columnObjects.concat(tableRef.columns);
  }

  //add all the columnObjects' names to the TableResponse's list of columns
  const columns: Column[] = [];
  for (const columnObject of columnObjects) {
    //if the columnObject has an alias, then the column in the table should be named this alias
    if(columnObject.alias) {
      columns.push({ key: columnObject.alias, label: columnObject.alias });
    }
    //otherwise, if the columnObject has aggregation applied to it, then the column should be named with the aggregate
    else if(columnObject.aggregation){
      columns.push({ key: columnObject.aggregation + '(' + columnObject.name + ')', label: columnObject.aggregation + '(' + columnObject.name + ')'});
    }
    //otherwise, simply name the column the column name
    else {
      columns.push({ key: columnObject.name, label: columnObject.name });
    }
  }

  //React hook for report modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  //A page state holding the page number of the query data that we are currently viewing
  const [pageNumber, setPageNumber] = useState(1);

  //A state holding the number of rows of query data that we would like to view per page (default = 20)
  const [rowsPerPage, setRowsPerPage] = useState(20);

  //A state holding the total number of pages that the data can fill
  const [totalPages, setTotalPages] = useState(1);

  //A loading state that will initially be true and later false once data has been loaded
  const [loading, setLoading] = useState(true);

  //A state holding the results of the query
  const [results, setResults] = useState<JSON[]>([]);

  async function downloadCSV() {
    const data = await getAllData();

    const dataProperties = {
      data: data,
      delimiter: ',',
    };

    csvDownload(dataProperties);
  }

  async function getAllData() {
    //fetch the data from the endpoint
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (await getToken()),
        },
        body: JSON.stringify(props.query),
      },
    );

    let json = await response.json();
    let jsonData = json.data;

    if (response.ok) {
      //remove qbee_id
      jsonData.map(function (item: any) {
        delete item.qbee_id;
        return item;
      });

      return jsonData;

    }
    else{
        
      if(json.response && json.response.message == 'You do not have a backend session'){
          navigateToAuth();
      }
      else if(json.response && json.response.message){
        toast.error(json.response.message, {id: "Query error"});
      }
      else{
        toast.error("Please check your query and try again", {id: "Query error"});
      }

    }
  }

  //Create an async list that will hold the query response data upon load
  let tableData = useAsyncList({
    //function that loads the data asynchronously - an optional sortDescriptor can be passed in
    async load({ sortDescriptor }) {
      //the data is being loaded
      setLoading(true);

      //get the query from props (making sure that it is a deep copy)
      let query: Query = JSON.parse(JSON.stringify(props.query));

      //if we want to sort, add SortParams to the QueryParams
      if (sortDescriptor) {
        query.queryParams.sortParams = {
          column: sortDescriptor.column + '',
          direction: sortDescriptor.direction,
        };
      }

      //add PageParams to the QueryParams
      query.queryParams.pageParams = {
        pageNumber: pageNumber,
        rowsPerPage: rowsPerPage,
      };

      //fetch the data from the endpoint
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query`,
        {
          credentials: 'include',
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (await getToken()),
          },
          body: JSON.stringify(query),
        },
      );

      let json = await response.json();

      if (response.ok) {
        setLoading(false);

        //set totalNumberOfPages
        const totalNumberOfRows = json.totalNumRows;
        const totalNumberOfPages = Math.ceil(totalNumberOfRows / rowsPerPage);
        setTotalPages(totalNumberOfPages);

        return {
          items: json.data
        }; 
      }
      else{

        if(json.response && json.response.message == 'You do not have a backend session'){
          navigateToAuth();
        }
        else if(json.response && json.response.message){
          toast.error(json.response.message, {id: "Query error"});
        }
        else{
          toast.error("Please check your query and try again", {id: "Query error"});
        }

        return {
          items: [],
        };
      }
    },
  });

  //reload the tableData after updating pageNumber
  useEffect(() => {
    tableData.reload();
  }, [pageNumber, rowsPerPage]);

  //get all data on load of
  useEffect(() => {
    const fetchData = async () => {
      setResults(await getAllData());
    };
    fetchData();
  }, []);

  return (
    <div style={{ overflow: 'scroll', maxHeight: '80vh', overflowX: 'hidden' }}>
      <Toaster/>
      <Table
        aria-label="Example table with dynamic content"
        sortDescriptor={tableData.sortDescriptor}
        onSortChange={tableData.sort}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} allowsSorting>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableData.items}
          isLoading={loading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            //@ts-ignore
            <TableRow key={item.qbee_id}>
              {(columnKey) => (
                <TableCell>
                  {typeof getKeyValue(item, columnKey) === 'object'
                    ? JSON.stringify(getKeyValue(item, columnKey))
                    : getKeyValue(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div
        className="flex w-full justify-between gap-1"
        style={{
          position: 'absolute',
          bottom: '0',
          backgroundColor: 'white',
          padding: '30px',
        }}
      >
        <div className="flex w-full justify-center">
          <Pagination
            showControls
            classNames={{
              cursor: 'bg-foreground text-background',
            }}
            color="default"
            page={pageNumber}
            total={totalPages}
            variant="light"
            onChange={(pageNumber) => {
              setPageNumber(pageNumber);
            }}
          />
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              defaultValue={20}
              onChange={(rowsPerPage) => {
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
        <SaveQueryModal query={props.query} />
        <Button
          color="primary"
          onClick={() => {
            downloadCSV();
          }}
        >
          Export Data
        </Button>
        <Button onPress={onOpen} color="primary">
          Generate Report
        </Button>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black h-100vh"
          size="full"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Query Report
            </ModalHeader>
            <Report
              data={results as JSON[]}
              metadata={{ title: `${props.metadata.title}` }}
            />
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
