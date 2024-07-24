"use client"
import "../../app/globals.css"
import React, { useState} from "react";
import { useParams } from 'next/navigation'
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, useDisclosure, ModalContent, Modal, ModalHeader, DropdownSection} from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { createClient } from "./../../utils/supabase/client";
import { Query, column, QueryParams } from "@/interfaces/intermediateJSON";

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
    const {databaseServerID} = useParams<{databaseServerID: string}>();

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

    //async function to fetch the joinable tables
    async function fetchJoinableTables(database: string, table: string) {

        let response = await fetch("http://localhost:55555/api/metadata/foreign-keys", {
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
                schema: database,
                table: table
            })
        });

        let json = await response.json();

        //set the joinable tables hook
        setJoinableTables(json);

    }

    //React hook for results modal
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    //React hook for all the databases in the database server
    const [databases, setDatabases] = useState<Database[]>([{key: "Select database", label: "Select database"}]);

    //React hook for all the tables in the database
    const [tables, setTables] = useState<Table[]>([{table: "Select table", columns: ["Select column"]}]);

    //React hook for all the joinable tables in the database
    const [joinableTables, setJoinableTables] = useState([]);

    //React hook containing all the databases selected by the user
    const [selectedDatabases, setSelectedDatabases] = useState(new Set(["Select database"]));
    //The label shown in the dropdown trigger/button
    const selectedDatabasesLabel = React.useMemo(
        () => Array.from(selectedDatabases).join(", "),
        [selectedDatabases]
    );

    const [outputQuery, setOutputQuery] = useState("");

    //React hook containing the QueryParams the user is busy building
    const [queryParams, setQueryParams] = useState<QueryParams>();

    //React hook containing all the tables selected by the user
    const [selectedTables, setSelectedTables] = useState(new Set(["Select table"]));
    //The label shown in the dropdown trigger/button
    const selectedTablesLabel = React.useMemo(
        () => Array.from(selectedTables).join(", "),
        [selectedTables]
    );

    //React hook containing all the tables selected by the user
    const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(new Set<string>());
    //The label shown in the dropdown trigger/button
    const selectedColumnsLabel = React.useMemo(
        () => Array.from(selectedColumns).join(", "),
        [selectedColumns]
    );

    //React hook to fetch the database server's databases upon rerender of the Form
    React.useEffect(() => {

        fetchDatabases();

    },[])

    //React hook to fetch the database's tables upon selection of the database
    React.useEffect(() => {

        fetchTables(selectedDatabasesLabel);

    },[selectedDatabasesLabel])

    //React hook to fetch joinable tables upon selection of a table
    React.useEffect(() => {

        fetchJoinableTables(selectedDatabasesLabel, selectedTablesLabel);

    },[selectedTablesLabel])

    //React hook to test update of joinable tables
    React.useEffect(() => {

        console.log(joinableTables);

    },[joinableTables])

    const handleDatabaseSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedDatabases(new Set(["Select database"])); // Reset to default
        } else {
            setSelectedDatabases(keys);
        }
        setSelectedTables(new Set(["Select table"])); // Clear selected columns
    };

    const handleTableSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedTables(new Set(["Select table"])); // Reset to default
        } else {
            setSelectedTables(keys);
        }
        setSelectedColumns(new Set()); // Clear selected columns
    };

    const handleAddJoinableTable = (key: React.Key) => {
        
    }

    const handleColumnSelection = (keys:any) => {
        if (keys.has("Select All")) {
            if (selectedColumns.size === tables.find(t => t.table === selectedTablesLabel)?.columns.length) {
                setSelectedColumns(new Set());
            } else {
                const allColumns = tables.find(t => t.table === selectedTablesLabel)?.columns || [];
                setSelectedColumns(new Set(allColumns));
            }
        } else {
            setSelectedColumns(keys);
        }
    };

    function createQuery() : Query {

        let columnStringArray = Array.from(selectedColumns);

        //if columns is empty, query all the columns of the selected table
        if(columnStringArray.length == 0){
            for(let table of tables){
                if(table.table == selectedTablesLabel){
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
            databaseServerID: databaseServerID,
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: selectedDatabasesLabel,
                table: {
                    name: selectedTablesLabel,
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
                        {selectedDatabasesLabel || "Select database"}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        className="max-h-[50vh] overflow-y-auto"
                        aria-label="Dynamic Actions" 
                        items={databases}
                        variant="flat"
                        // disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedDatabases}
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
                {!selectedDatabases.has("Select database") ? 
                    (<>
                 <div className="flex justify-between">
                    <h2>Table to query:</h2>
                    {(joinableTables.length > 0) && (
                        <>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="bordered">+</Button>
                                </DropdownTrigger>
                                <DropdownMenu 
                                    items={joinableTables} 
                                    onAction={handleAddJoinableTable}
                                >
                                    {(item:any) => (
                                    <DropdownItem
                                        key={item.table_name}
                                    >
                                        {item.table_name}
                                    </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    )
                    }
                </div>
                <Dropdown className="text-black">
                    <DropdownTrigger>
                        <Button 
                        variant="bordered" 
                        className="capitalize"
                        >
                        {selectedTablesLabel}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        className="max-h-[50vh] overflow-y-auto"
                        aria-label="Dynamic Actions" 
                        items={tables} 
                        variant="flat"
                        selectionMode="single"
                        selectedKeys={selectedTables}
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
                
                {!selectedTables.has("Select table") ? 
                    (<>
                        <div className="flex">
                            <h2>Select the columns to display:</h2>
                        </div>
                        <Dropdown className="text-black">
                            <DropdownTrigger>
                                <Button 
                                variant="bordered" 
                                >
                                {selectedColumnsLabel || "No columns selected, will default to all columns selected"} 
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                className="max-h-[50vh] overflow-y-auto"
                                aria-label="Multiple column selection"
                                variant="flat"
                                items={tables.filter(item => item.table === selectedTablesLabel)[0]?.columns.map(col => ({ table: selectedTablesLabel, columns: [col] }))}
                                closeOnSelect={false}
                                // disallowEmptySelection
                                selectionMode="multiple"
                                selectedKeys={selectedColumns}
                                onSelectionChange={handleColumnSelection}
                            >
                                <DropdownItem key="Select All">
                                    Select All
                                </DropdownItem>
                                {tables.map((item) => (
                                    (item.table == selectedTablesLabel)?(
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
                {!selectedTables.has("Select table") ? 
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