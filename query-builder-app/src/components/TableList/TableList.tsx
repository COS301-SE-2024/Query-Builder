//----------------------------IMPORTS------------------------------------//

import {table} from "../../interfaces/intermediateJSON"
import React, { useState } from "react";
import TableForm from "../TableForm/TableForm"
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer } from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";

//----------------------------INTERFACES------------------------------------//

interface TableListProps {
    databaseName: string,
    table: table
}

interface JoinableTable {
    table_name: string,
    qbee_id: number,
    REFERENCED_COLUMN_NAME: string,
    COLUMN_NAME: string,
    //present in from
    REFERENCED_TABLE_SCHEMA?: string,
    //present in to
    TABLE_SCHEMA?: string
}

export default function TableList(props: TableListProps){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for the table data model of the TableList
    const [table, setTable] = useState<table>(props.table);

    //React hook for all the joinable tables in the database
    const [joinableTables, setJoinableTables] = useState<JoinableTable[]>([]);

    //React hook to fetch the database's tables upon render of the TableList
    React.useEffect(() => {

        fetchAllTables(props.databaseName);

    },[])

    //React hook to fetch all joinable tables upon update of table
    React.useEffect(() => {

        //check to exclude this code running on first render

        if(table.name != ""){
            //find the last table
            let tableRef: table = table;
            while(tableRef.join != null){
                tableRef = tableRef.join.table2;
            }
            //tableRef is now the last table in the join linked list
            //fetch joinable tables based on tableRef

            fetchJoinableTables(props.databaseName, tableRef.name);
        }

    },[table])

    React.useEffect(() => {

        console.log(joinableTables);

    },[joinableTables])

    //----------------------------HELPER FUNCTIONS------------------------------------//

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
    
        console.log(token)
    
        return token;
    };

    //async function to fetch all the database's tables
    async function fetchAllTables(database: string) {

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
        setJoinableTables(json);

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

    //helper function called when a table is selected in the table DropdownMenu
    function handleTableSelection(key: any, table: table){
    
        //if table.name is empty, add the key as the name
        if(table.name == ""){
            setTable((previousTableState) => {
                return {...previousTableState, name: key}
            });
        }
        //else, join a new table, with name 'key', onto the table (or call the callback to do this)
        else{

            let table1MatchingColumnName: string;
            let table2MatchingColumnName: string;

            //use the key to search through joinableTables to find the correct column names to match on
            for(let table of joinableTables){
                if(table.table_name == key){
                    if(table.REFERENCED_TABLE_SCHEMA){
                        //from - so COLUMN_NAME is table1MatchingColumnName and REFERENCED_COLUMN_NAME is table2MatchingColumnName
                        table1MatchingColumnName = table.COLUMN_NAME;
                        table2MatchingColumnName = table.REFERENCED_COLUMN_NAME;
                    }
                    else{
                        //to - so REFERENCED_COLUMN_NAME is table1MatchingColumnName and COLUMN_NAME is table2MatchingColumnName
                        table1MatchingColumnName = table.REFERENCED_COLUMN_NAME;
                        table2MatchingColumnName = table.COLUMN_NAME;
                    }
                }
            }

            setTable((previousTableState) => {
                return {...previousTableState, join: {
                    table1MatchingColumnName: table1MatchingColumnName,
                    table2MatchingColumnName: table2MatchingColumnName,
                    table2: {
                        name: key,
                        columns: []
                    }
                }}
            });
        }

    }

    function createTableCard(tableRef: table){

        return(
            <Card className="w-full">
                <CardBody className="flex flex-row items-center space-x-2">
        
                {//div for the name
                    <div className="flex flex-1">
                        {tableRef.name}
                    </div>
                }
        
                {//make sure to include the join button for the last table
                    (tableRef.join == null) && (joinableTables.length > 0) && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered">+</Button>
                            </DropdownTrigger>
                            <DropdownMenu 
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={joinableTables} 
                                    onAction={(key) => handleTableSelection(key, tableRef)}
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
                    )
                }
        
                </CardBody>
            </Card>
        )

    }

    //----------------------------CREATE THE ARRAYS OF TABLES AND TABLE FORMS------------------------------------//

    //create an array of tables
    const tables: React.JSX.Element[] = [];
    //create an array of TableForms
    const tableForms: React.JSX.Element[] = [];

    //create a table reference
    let tableRef = table;

    //add the table for the first (compulsory) table
    tables.push(createTableCard(tableRef));
    //add the TableForm for the first (compulsory) table
    tableForms.push(<TableForm table={tableRef} ></TableForm>)

    //iterate over the linked list of joined tables
    while(tableRef.join != null){
        tableRef = tableRef.join.table2;
        //add the table for the next table
        tables.push(createTableCard(tableRef));
        //add the TableForm for the next table
        tableForms.push(<TableForm table={tableRef} ></TableForm>)
    }

    //----------------------------RENDER THE COMPONENT------------------------------------//

    return(
        <>
            <h2>Select a table:</h2>
            <Spacer y={2}/>
            <div className="flex space-x-4">
                {tables}
            </div>
            <Spacer y={4}/>
            {//Display the TableForms only if there is a table selected (table.name is not empty)
                ((table.name != "") && (
                    <div className="flex space-x-4">
                        {tableForms}
                    </div>
                ))
            }
            <h1>{JSON.stringify(table)}</h1>
        </>
    );

}