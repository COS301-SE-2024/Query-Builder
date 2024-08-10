"use client"

//----------------------------IMPORTS------------------------------------//

import "../../app/globals.css"
import React, { useState} from "react";
import { useParams } from 'next/navigation'
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, useDisclosure, ModalContent, Modal, ModalHeader, DropdownSection} from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { createClient } from "./../../utils/supabase/client";
import { compoundCondition, condition, LogicalOperator, Query, table} from "@/interfaces/intermediateJSON";
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
        databaseServerID: databaseServerID[0],
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

    //Separate React hook for the Query's condition
    const [condition, setCondition] = useState<compoundCondition>();

    //React hook to fetch the database server's databases upon rerender of the Form
    React.useEffect(() => {

        if(databaseServerID.length > 1){
            console.log("Load query");

            getQuery();

        }

    },[databaseServerID])

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
    
    //callback function for FilterList
    //fix infinite update loop problem
    //need to only update part of queryParams, not the table part since that is not changing
    //only the condition is changing
    function updateCondition(updatedCondition: compoundCondition) {

        if(updatedCondition.conditions.length > 0){
            setCondition(updatedCondition);
        }

    }

    //merges query and condition
    function getMergedQuery(){
        
        if(condition != null){
            const mergedQuery: Query = {
                ...query,
                queryParams: {
                    ...query.queryParams,
                    condition: condition
                }
            }
    
            return mergedQuery; 
        }
        else{
            return query;
        }

    }

    async function getQuery(){

        let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-single-query`, {
            credentials: "include",
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                query_id: databaseServerID[1]
            })
        });

        let json = await response.json();

        console.log(json.parameters);

        const newQueryParams = json.parameters;

        setQuery((previousQueryState) => {
        
            return {
                ...previousQueryState,
                queryParams: {
                    ...previousQueryState.queryParams,
                    databaseName: newQueryParams.databaseName,
                    language: newQueryParams.language,
                    query_type: newQueryParams.query_type,
                    table: newQueryParams.table
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
                databaseServerID: databaseServerID[0]
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
                            databaseServerID={databaseServerID[0]}
                            databaseName={query.queryParams.databaseName} 
                            table={query.queryParams.table} 
                            onChange={updateTable}
                        />
                    )
                }
                
                <Spacer y={2}/>

                {/* Add filters */}
                {
                    (query.queryParams.table.name != "") && (
                        <FilterList 
                            condition={query.queryParams.condition! as compoundCondition} 
                            table={query.queryParams.table} 
                            databaseServerID={databaseServerID[0]}
                            onChange={updateCondition}
                        />
                    )
                }
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
                                    <TableResponse query={getMergedQuery()} />
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