"use client"

//----------------------------IMPORTS------------------------------------//

import "../../app/globals.css"
import React, { useState} from "react";
import { useParams } from 'next/navigation'
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, useDisclosure, ModalContent, Modal, ModalHeader, DropdownSection} from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { createClient } from "./../../utils/supabase/client";
import { Query, table} from "@/interfaces/intermediateJSON";
import TableList from "../TableList/TableList";
import FilterList from "../FilterList/FilterList";

//----------------------------INTERFACES------------------------------------//

interface Database {
    SCHEMA_NAME: string
}

export default function Form(){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for URL params
    const {databaseServerID} = useParams<{databaseServerID: string}>();

    //React hook for results modal
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    //React hook for all the databases in the database server
    const [databases, setDatabases] = useState<Database[]>();

    //React hook containing the Query the user is busy building
    const [query, setQuery] = useState<Query>({
        credentials: {
            host: "127.0.0.1",
            user: "root",
            password: "testPassword"
        },
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

    //----------------------------HELPER FUNCTIONS------------------------------------//

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
    
        console.log(token)
    
        return token;
    };

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
    
        let response = await fetch("http://localhost:55555/api/metadata/schemas", {
            credentials: "include",
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
        setDatabases(json.data);

    }

    const handleDatabaseSelection = (key: any) => {

        setQuery({
            ...query,
            queryParams: {
                ...query.queryParams,
                databaseName: key
            }
        });

    };

    return (

        <>
        <div className="app overflow-visible">
        <Card className="overflow-visible">
            <CardHeader>
                <div className="flex">
                    <h1>Create a query</h1>
                </div>
            </CardHeader>
            <CardBody className="overflow-visible"> 
                {/* Select a database */}
                <h2>Select a database:</h2>
                <Spacer y={2}/>
                <Card className="w-full">
                    <CardBody className="flex flex-row items-center space-x-2">
                    
                    {//div for the name
                        <div className="flex flex-1">
                            {query.queryParams.databaseName}
                        </div>
                    }

                    {//include the add button if no database is selected yet
                        (query.queryParams.databaseName == "") && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="bordered">+</Button>
                                </DropdownTrigger>
                                <DropdownMenu 
                                        className="max-h-[50vh] overflow-y-auto"
                                        items={databases} 
                                        onAction={(key) => handleDatabaseSelection(key)}
                                    >
                                        {(item:any) => (
                                        <DropdownItem
                                            key={item.SCHEMA_NAME}
                                        >
                                            {item.SCHEMA_NAME}
                                        </DropdownItem>
                                        )}
                                    </DropdownMenu>
                            </Dropdown>
                        )
                    }

                    </CardBody>
                </Card>
                
                <Spacer y={2}/>

                {/* Select tables */}
                {   
                    (query.queryParams.databaseName != "") && (
                        <TableList 
                            databaseName={query.queryParams.databaseName} 
                            table={query.queryParams.table} 
                            onChange={updateTable}
                        />
                    )
                }
                
                <Spacer y={2}/>

                {/* Add filters */}
                {/* {
                    (query.queryParams.table.name != "") && (
                        <></>
                    )
                } */}
                
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
            </CardFooter>
        </Card>
        </div>
      </>
    )

}