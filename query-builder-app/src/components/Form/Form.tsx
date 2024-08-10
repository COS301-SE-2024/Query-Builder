"use client"
import "../../app/globals.css"
import React, { useState} from "react";
import { useParams } from 'next/navigation'
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, useDisclosure, ModalContent, Modal, ModalHeader, DropdownSection} from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { createClient } from "./../../utils/supabase/client";
import { Query, table} from "@/interfaces/intermediateJSON";
import TableList from "../TableList/TableList";

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

    //callback function for TableList
    function updateTable(updatedTable: table) {

        setQuery((previousQueryState) => {
        
            return {
                ...previousQueryState,
                queryParams: {
                    ...previousQueryState.queryParams,
                    table: updatedTable
                }
            }

        });
    }

    //async function to fetch the database server's databases
    async function fetchDatabases() {
    
        let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/schemas`, {
            credentials: "include",
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: databaseServerID
            })
        });

        let json = await response.json();

        console.log(json);

        //set the databases hook
        setDatabases(json);

    }

    //React hook for results modal
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    //React hook for all the databases in the database server
    const [databases, setDatabases] = useState<Database[]>([{key: "Select database", label: "Select database"}]);

    //React hook containing all the databases selected by the user
    const [selectedDatabases, setSelectedDatabases] = useState(new Set(["Select database"]));
    //The label shown in the dropdown trigger/button
    const selectedDatabasesLabel = React.useMemo(
        () => Array.from(selectedDatabases).join(", "),
        [selectedDatabases]
    );

    const [outputQuery, setOutputQuery] = useState("");

    //React hook containing the Query the user is busy building
    const [query, setQuery] = useState<Query>({
        databaseServerID: databaseServerID,
        queryParams: {
            language: "sql",
            query_type: "select",
            databaseName: "",
            table: {
                name: "",
                columns: []
            }
        }
    });

    //React hook to fetch the database server's databases upon rerender of the Form
    React.useEffect(() => {

        fetchDatabases();

    },[])

    const handleDatabaseSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedDatabases(new Set(["Select database"])); // Reset to default
        } else {
            setSelectedDatabases(keys);
            setQuery({
                ...query,
                queryParams: {
                    ...query.queryParams,
                    databaseName: "sakila"
                }
            })
        }
    };

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
                {/* Select tables */}
                {!selectedDatabases.has("Select database") ? 
                    (<TableList databaseServerID={databaseServerID} databaseName={selectedDatabasesLabel} table={query.queryParams.table} onChange={updateTable}></TableList>) : null}
                
                <h1>
                    {JSON.stringify(query)}
                </h1>
            </CardBody>
            <CardFooter>
                <>
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
                                    <TableResponse query={query} />
                                </>
                            )}
                        </ModalContent>
                   </Modal>
                </>
                <Spacer y={2}/>
                {outputQuery == "" ? null:(<div>{outputQuery}</div>)}
            </CardFooter>
        </Card>
        </div>
      </>
    )

}