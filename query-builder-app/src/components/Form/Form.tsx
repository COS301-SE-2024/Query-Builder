"use client"
import "../../app/globals.css"
import React, { useState} from "react";
import { useParams } from 'next/navigation'
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, useDisclosure, ModalContent, Modal, ModalHeader} from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { createClient } from "./../../utils/supabase/client";
import { Query, column } from "@/interfaces/intermediateJSON";

  interface Database {
    key: string,
    label: string
  }

  interface Table {
    table: string,
    columns: string[]
  }

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    console.log(token)
  
    return token;
};


export default function Form(){

    //React hook for URL params
    const {databaseServerID} = useParams();

    //async function to get the database credentials, either from supabase, or prompt the user
    async function getDatabaseCredentials() {

        //query the appropriate endpoint to get the credentials for the database, passing through the session key

        console.log(databaseServerID);

    }

    //async function to fetch the database server's databases
    async function fetchDatabases() {

        let databaseCredentials = await getDatabaseCredentials();
    
        let response = await fetch("http://localhost:55555/api/metadata/schemas", {
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                host: "127.0.0.1",
                user: "root",
                password: "testPassword"
            })
        });

        let json = await response.json();

        console.log(json);

        //set the databases hook
        setDatabases(json);

    }

    //async function to fetch the database server's tables
    async function fetchTables(database: string) {

        let response = await fetch("http://localhost:55555/api/metadata/tables", {
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                credentials: {
                    host: "127.0.0.1",
                    user: "root",
                    password: "testPassword"
                },
                schema: database
            })
        });

        let json = await response.json();

        console.log(json);

        //set the tables hook
        setTables(json);

    }

    //React hook for results modal
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    //React hook for all the databases in the database server
    const [databases, setDatabases] = useState<Database[]>([{key: "Select database", label: "Select database"}]);

    //React hook for all the tables in the database
    const [tables, setTables] = useState<Table[]>([{table: "Select table", columns: ["Select column"]}]);

    const [selectedDatabase, setSelectedDatabase] = useState(new Set(["Select database"]));
    const selectedDatabaseValue = React.useMemo(
        () => Array.from(selectedDatabase).join(", "),
        [selectedDatabase]
    );

    const [outputQuery, setOutputQuery] = useState("");

    const [selectedTable, setSelectedTable] = useState(new Set(["Select table"]));
    const selectedTableValue = React.useMemo(
        () => Array.from(selectedTable).join(", "),
        [selectedTable]
    );

    const [selectColumns, setSelectedColumns] = React.useState<Set<string>>(new Set<string>());
    const selectedColValue = React.useMemo(
        () => Array.from(selectColumns).join(", "),
        [selectColumns]
    );

    //React hook to fetch the database server's databases upon rerender of the Form
    React.useEffect(() => {

        fetchDatabases();

    },[])

    //React hook to fetch the database's tables upon selection of the database
    React.useEffect(() => {

        fetchTables(selectedDatabaseValue);

    },[selectedDatabaseValue])

    const handleDatabaseSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedDatabase(new Set(["Select database"])); // Reset to default
        } else {
            setSelectedDatabase(keys);
        }
        setSelectedTable(new Set(["Select table"])); // Clear selected columns
    };

    const handleTableSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedTable(new Set(["Select table"])); // Reset to default
        } else {
            setSelectedTable(keys);
        }
        setSelectedColumns(new Set()); // Clear selected columns
    };

    const handleColumnSelection = (keys:any) => {
        if (keys.has("Select All")) {
            if (selectColumns.size === tables.find(t => t.table === selectedTableValue)?.columns.length) {
                setSelectedColumns(new Set());
            } else {
                const allColumns = tables.find(t => t.table === selectedTableValue)?.columns || [];
                setSelectedColumns(new Set(allColumns));
            }
        } else {
            setSelectedColumns(keys);
        }
    };

    function createQuery() : Query {

        let columnStringArray = Array.from(selectColumns);

        //if columns is empty, query all the columns of the selected table
        if(columnStringArray.length == 0){
            for(let table of tables){
                if(table.table == selectedTableValue){
                    columnStringArray = table.columns;
                }
            }
        }

        //create a columns array
        const columnArray: column[] = [];

        for(let columnString of columnStringArray){
            columnArray.push({
                name: columnString
            });
        }

        const query: Query = {
            credentials: {
                host: "127.0.0.1",
                user: "root",
                password: "testPassword"
            },
            databaseName: selectedDatabaseValue,
            queryParams: {
                language: "sql",
                query_type: "select",
                table: {
                    name: selectedTableValue,
                    columns: columnArray
                }
            }
        }

        return query;

    }

    return (

        <>
        <div className="app">
        <Card>
            <CardHeader>
                <div className="flex">
                    <h1>Create a query</h1>
                </div>
            </CardHeader>
            <CardBody> 
                {/* add databases */}
                <div className="flex">
                    <h2>Database to query:</h2>
                </div>
                <Dropdown className="text-black">
                    <DropdownTrigger>
                        <Button 
                        variant="bordered" 
                        className="capitalize"
                        >
                        {selectedDatabaseValue || "Select database"}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        className="max-h-[50vh] overflow-y-auto"
                        aria-label="Dynamic Actions" 
                        items={databases}
                        variant="flat"
                        // disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedDatabase}
                        onSelectionChange={handleDatabaseSelection}
                    >
                        {(item:any) => (
                        <DropdownItem
                            key={item.key}
                        >
                            {item.label}
                        </DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
                <Spacer y={2}/>
                {/* Select columns */}
                {!selectedDatabase.has("Select database") ? 
                    (<>
                 <div className="flex">
                    <h2>Table to query:</h2>
                </div>
                <Dropdown className="text-black">
                    <DropdownTrigger>
                        <Button 
                        variant="bordered" 
                        className="capitalize"
                        >
                        {selectedTableValue}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        className="max-h-[50vh] overflow-y-auto"
                        aria-label="Dynamic Actions" 
                        items={tables} 
                        variant="flat"
                        selectionMode="single"
                        selectedKeys={selectedTable}
                        onSelectionChange={handleTableSelection}
                    >
                        {(item:any) => (
                        <DropdownItem
                            key={item.table}
                        >
                            {item.table}
                        </DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
                <Spacer y={2}/>
                </>) : null}
                {/* select columns */}
                
                {!selectedTable.has("Select table") ? 
                    (<>
                        <div className="flex">
                            <h2>Select the columns to display:</h2>
                        </div>
                        <Dropdown className="text-black">
                            <DropdownTrigger>
                                <Button 
                                variant="bordered" 
                                >
                                {selectedColValue || "No columns selected, will default to all columns selected"} 
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                className="max-h-[50vh] overflow-y-auto"
                                aria-label="Multiple column selection"
                                variant="flat"
                                items={tables.filter(item => item.table === selectedTableValue)[0]?.columns.map(col => ({ table: selectedTableValue, columns: [col] }))}
                                closeOnSelect={false}
                                // disallowEmptySelection
                                selectionMode="multiple"
                                selectedKeys={selectColumns}
                                onSelectionChange={handleColumnSelection}
                            >
                                <DropdownItem key="Select All">
                                    Select All
                                </DropdownItem>
                                {tables.map((item) => (
                                    (item.table == selectedTableValue)?(
                                        (item.columns).map((col) =>
                                            <DropdownItem
                                            key={col}
                                        >
                                            {col}
                                        </DropdownItem>) 
                                    ):(null)
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </>):
                    null
                    }
            </CardBody>
            <CardFooter>
                {!selectedTable.has("Select table") ? 
                (<>
                    <Button 
                        onPress={onOpen} 
                        color="primary"  
                    >
                    Query
                  </Button>
                  <Modal 
                        isOpen={isOpen} 
                        onOpenChange={onOpenChange}
                        placement="top-center"
                        className="text-black h-100vh"
                        size="full">
                        <ModalContent>
                            {(onClose : any) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Query Results</ModalHeader>
                                    <TableResponse query={createQuery()} />
                                </>
                            )}
                        </ModalContent>
                   </Modal>
                </>) :null}
                <Spacer y={2}/>
                {outputQuery == "" ? null:(<div>{outputQuery}</div>)}
            </CardFooter>
        </Card>
        </div>
      </>
    )

}