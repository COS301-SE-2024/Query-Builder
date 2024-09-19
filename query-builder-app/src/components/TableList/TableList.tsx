//----------------------------IMPORTS------------------------------------//

import { table } from "../../interfaces/intermediateJSON"
import React, { useState } from "react";
import TableForm from "../TableForm/TableForm"
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer } from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { navigateToAuth } from "../../app/authentication/actions";

//----------------------------INTERFACES------------------------------------//

interface TableListProps {
    databaseServerID: string,
    databaseName: string,
    table: table
    onChange?: (table: table) => void
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

export default function TableList(props: TableListProps) {

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for the table data model of the TableList
    const [table, setTable] = useState<table>(props.table);

    //React hook for all the joinable tables in the database
    const [joinableTables, setJoinableTables] = useState<JoinableTable[]>([]);

    //React hook to inform the parent component that the data model has changed
    React.useEffect(() => {

        if ((props.onChange != null)) {
            props.onChange(table);
        }

    }, [table])

    //React hook to fetch the database's tables upon render of the TableList
    React.useEffect(() => {

        fetchAllTables(props.databaseName);

    }, [])

    //React hook to fetch all joinable tables upon update of table
    React.useEffect(() => {

        //check to exclude this code running on first render

        if (table.name != "") {
            //find the last table
            let tableRef: table = table;
            while (tableRef.join != null) {
                tableRef = tableRef.join.table2;
            }
            //tableRef is now the last table in the join linked list
            //fetch joinable tables based on tableRef

            fetchJoinableTables(props.databaseName, tableRef.name);
        }

    }, [table])

        //React hook to fetch all tables upon update of table if no tables selected
        React.useEffect(() => {

            //check to exclude this code running on first render
    
            if (table == null || table.name == "") {

                fetchAllTables(props.databaseName);
            }
    
        }, [table])

    React.useEffect(() => {

        console.log(joinableTables);

    }, [joinableTables])

    //----------------------------HELPER FUNCTIONS------------------------------------//

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
        return token;

    };

    //callback function for TableForm
    function updateTable(updatedTable: table) {

        setTable((previousTableState) => {

            function updateTableRef(tableRef: table): table {
                if (tableRef.name === updatedTable.name) {
                    return {
                        ...updatedTable, // Update name and columns from updatedTable
                        join: tableRef.join // Keep the original join property
                    };
                } else if (tableRef.join) {
                    return {
                        ...tableRef,
                        join: {
                            ...tableRef.join,
                            table2: updateTableRef(tableRef.join.table2)
                        }
                    };
                }
                return tableRef;
            }

            return updateTableRef(previousTableState);
        });
    }

    //async function to fetch all the database's tables
    async function fetchAllTables(database: string) {

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/tables`, {
            credentials: "include",
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: props.databaseServerID,
                schema: database
            })
        });

        if (!response) {
            return;
        }


        let json = await response.json();

        if (response.ok) {
            //set the tables hook
            setJoinableTables(json);
        }
        else{
        
            if(json.response && json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }

        }

    }

    //async function to fetch the joinable tables
    async function fetchJoinableTables(database: string, tableName: string) {

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/foreign-keys`, {
            credentials: "include",
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: props.databaseServerID,
                schema: database,
                table: tableName
            })
        });

        if (!response) {
            return;
        }

        let json = await response.json();

        if (response.ok) {
            //remove any tables already in the query to prevent circular joins
            let tableRef: table = table;
            json = json.filter((obj: JoinableTable) => { return obj.table_name != tableRef.name });
            while (tableRef.join) {
                tableRef = tableRef.join.table2;
                json = json.filter((obj: JoinableTable) => { return obj.table_name != tableRef.name });
            }

            //set the joinable tables hook
            setJoinableTables(json);
        }
        else{
        
            if(json.response && json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }

        }

    }

    //helper function called when a table is selected in the table DropdownMenu
    function handleTableSelection(key: any, table: table) {

        //if table.name is empty, add the key as the name
        if (table.name == "") {
            setTable((previousTableState) => {
                return { ...previousTableState, name: key }
            });
        }
        //else, join a new table, with name 'key', onto the table (or call the callback to do this)
        else {

            let table1MatchingColumnName: string;
            let table2MatchingColumnName: string;

            //use the key to search through joinableTables to find the correct column names to match on
            for (let table of joinableTables) {
                if (table.table_name == key) {
                    if (table.REFERENCED_TABLE_SCHEMA) {
                        //from - so COLUMN_NAME is table1MatchingColumnName and REFERENCED_COLUMN_NAME is table2MatchingColumnName
                        table1MatchingColumnName = table.COLUMN_NAME;
                        table2MatchingColumnName = table.REFERENCED_COLUMN_NAME;
                    }
                    else {
                        //to - so REFERENCED_COLUMN_NAME is table1MatchingColumnName and COLUMN_NAME is table2MatchingColumnName
                        table1MatchingColumnName = table.REFERENCED_COLUMN_NAME;
                        table2MatchingColumnName = table.COLUMN_NAME;
                    }
                }
            }

            setTable((previousTableState) => {
                function addTableToJoin(tableState: table): table {
                    if (!tableState.join) {
                        return {
                            ...tableState,
                            join: {
                                table1MatchingColumnName: table1MatchingColumnName,
                                table2MatchingColumnName: table2MatchingColumnName,
                                table2: {
                                    name: key,
                                    columns: []
                                }
                            }
                        };
                    } else {
                        return {
                            ...tableState,
                            join: {
                                ...tableState.join,
                                table2: addTableToJoin(tableState.join.table2)
                            }
                        };
                    }
                }

                return addTableToJoin(previousTableState);
            });
        }

    }

    function createTableCard(tableRef: table) {
        return (
            <Card className="w-full">
                <CardBody className="flex flex-row items-center space-x-2">
                    {/* div for the name */}
                    <div className="flex flex-1">
                        {tableRef.name}
                    </div>

                    {/* Add button for removing the table */}
                    {tableRef.name && (
                        <Button
                            variant="bordered"
                            aria-label="remove table button"
                            onClick={() => removeTableJoin(tableRef)}
                        >
                            -
                        </Button>
                    )}

                    {/* Add button for joining a new table */}
                    {tableRef.join == null && joinableTables.length > 0 && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="bordered"
                                    aria-label="add table button"
                                    disabled={joinableTables.length === 0}
                                >
                                    +
                                </Button>
                            </DropdownTrigger>
                            {joinableTables.length > 0 && (
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={joinableTables}
                                    onAction={(key) => handleTableSelection(key, tableRef)}
                                >
                                    {(item: any) => (
                                        <DropdownItem key={item.table_name}>
                                            {item.table_name}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            )}
                        </Dropdown>
                    )}

                </CardBody>
            </Card>
        );
    }

    function removeTableJoin(tableRef: table) {
        setTable((previousTableState) => {
            function removeTable(tableState: table): table | null {
                if (tableState.name === tableRef.name) {
                    return null;
                }

                if (tableState.join) {
                    const updatedJoin = removeTable(tableState.join.table2);

                    if (updatedJoin === null && tableState.join.table2.name === tableRef.name) {
                        return {
                            ...tableState,
                            join: undefined
                        };
                    }

                    return {
                        ...tableState,
                        join: {
                            ...tableState.join,
                            table2: updatedJoin || {
                                name: "",
                                columns: []
                            }
                        }
                    };
                }

                return tableState;
            }

            function findRightmostTableName(tableState: table): string {
                let currentTable = tableState;
                while (currentTable.join && currentTable.join.table2) {
                    currentTable = currentTable.join.table2;
                }
                return currentTable.name;
            }

            const updatedTable = removeTable(previousTableState);

            if (updatedTable === null) {
                return {
                    name: "",
                    columns: []
                };
            }

            const rightmostTableName = findRightmostTableName(updatedTable);

            if (rightmostTableName === "") {
                fetchAllTables(props.databaseName);
            }
            else {
                fetchJoinableTables(props.databaseName, rightmostTableName);
            }

            return updatedTable;
        });
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
    tableForms.push(<TableForm databaseServerID={props.databaseServerID} table={tableRef} onChange={updateTable} ></TableForm>)

    //iterate over the linked list of joined tables
    while (tableRef.join != null) {
        tableRef = tableRef.join.table2;
        //add the table for the next table
        tables.push(createTableCard(tableRef));
        //add the TableForm for the next table
        tableForms.push(<TableForm databaseServerID={props.databaseServerID} table={tableRef} onChange={updateTable} ></TableForm>)
    }

    //----------------------------RENDER THE COMPONENT------------------------------------//

    return (
        <>
            <h2>Select some tables:</h2>
            <Spacer y={2} />
            <div className="flex space-x-4">
                {tables}
            </div>
            <Spacer y={4} />
            {//Display the TableForms only if there is a table selected (table.name is not empty)
                ((table.name != "") && (
                    <div className="flex space-x-4">
                        {tableForms}
                    </div>
                ))
            }
        </>
    );

}