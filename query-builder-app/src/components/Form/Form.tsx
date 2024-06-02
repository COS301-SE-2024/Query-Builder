"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Button, Input, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";


export default function Form(){

    // const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [selectedDatabase, setSelectedDatabase] = useState(new Set(["Select database"]));
    const selectedDatabaseValue = React.useMemo(
        () => Array.from(selectedDatabase).join(", ").replaceAll("_", " "),
        [selectedDatabase]
    );

    const [selectedTable, setSelectedTable] = useState(new Set(["Select table"]));
    const selectedTableValue = React.useMemo(
        () => Array.from(selectedTable).join(", ").replaceAll("_", " "),
        [selectedTable]
    );

    const [selectColumns, setSelectedColumns] = React.useState(new Set());
    const selectedColValue = React.useMemo(
        () => Array.from(selectColumns).join(", ").replaceAll("_", " "),
        [selectColumns]
    );

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
          key: "My_Company_database",
          label: "My Company Database",
        }
    ];

    const tables = [
        {
            table: "Users",
            columns: ["Name","Surname","Email"],
        },
        {
            table: "Finance",
            columns: ["Month","Total","Average"],
        }
    ];

    const sendQuery = (query:string) => {
        
    }

    return (

        <>
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
                        {selectedDatabaseValue}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                    aria-label="Dynamic Actions" 
                        items={databases}
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedDatabase}
                        onSelectionChange={setSelectedDatabase}
                    >
                        {(item) => (
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
                        {(item) => (
                        <DropdownItem
                            key={item.table}
                        >
                            {item.table}
                        </DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
                <Spacer y={2}/>
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
                                className="capitalize"
                                >
                                {selectedColValue}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu 
                                aria-label="Multiple selection example"
                                variant="flat"
                                items={tables} 
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
                    (<></>)}
            </CardBody>
        </Card>
      </>
    )

}