"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Form(){

    // const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [selectedDatabase, setSelectedDatabase] = useState(new Set(["Select database"]));
    const selectedDatabaseValue = React.useMemo(
        () => Array.from(selectedDatabase).join(", ").replaceAll("_", " "),
        [selectedDatabase]
    );

    const [outputQuery, setOutputQuery] = useState("");

    const [selectedTable, setSelectedTable] = useState(new Set(["Select table"]));
    const selectedTableValue = React.useMemo(
        () => Array.from(selectedTable).join(", ").replaceAll("_", " "),
        [selectedTable]
    );

    const [selectColumns, setSelectedColumns] = React.useState<Set<string>>(new Set<string>());
    const selectedColValue = React.useMemo(
        () => Array.from(selectColumns).join(", ").replaceAll("_", " "),
        [selectColumns]
    );

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

    const databases = [
        {
          key: "sakila",
          label: "Sakila",
        }
    ];

    const tables = [
        {
            table: "film",
            columns: ["title", "release_year", "rating", "rental_rate", "rental_duration", "language_id"],
        },
        {
            table: "actor",
            columns: ["Month","Total","Average"],
        }
    ];

    const sendQuery = (language:string, queryType:string, table:string, column:string, condition:string) => {

        fetch("http://localhost:55555/api/query", {
          method: "POST",
          headers: {
            'Accept': 'application/text',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "language": language,
            "query_type": queryType,
            "table": table,
            "column": column,
            "condition": ""
          })
        }).then(
          function(response){
            return response.text();
           
          }
        )
        .then(
          function(response){
            // alert(response);
            setOutputQuery(response);
          }
        )
  
      }

    //create a NEXT router to navigate to individual database pages
    const router = useRouter();

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
                    color="primary"  
                    onClick={() => {
                        
                        sendQuery("sql", "select", selectedTableValue, selectedColValue, "");
                    }}
                    >
                    Query
                  </Button>
                </>) :null}
                <Spacer y={2}/>
                {outputQuery == "" ? null:(<div>{outputQuery}</div>)}
            </CardFooter>
        </Card>
        </div>
      </>
    )

}