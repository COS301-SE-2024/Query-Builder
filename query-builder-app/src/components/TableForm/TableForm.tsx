import React, { useState } from "react";
import { column, table } from "../../interfaces/intermediateJSON"
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer } from "@nextui-org/react";
import ColumnChip from "../ColumnChip/ColumnChip";
import { createClient } from "./../../utils/supabase/client";
import { navigateToAuth } from "../../app/authentication/actions";

interface TableFormProps {
    databaseServerID: string,
    table: table,
    onChange?: (table: table) => void
}

interface SelectableColumn {
    name: string
}

export default function TableForm(props: TableFormProps){

    const [table, setTable] = useState<table>(props.table);

    const [allColumns, setAllColumns] = useState<SelectableColumn[]>([]);

    //React hook to fetch the table's columns upon render of TableForm
    React.useEffect(() => {

        fetchColumns();

    },[])

    //React hook to inform the parent component that the data model has changed
    React.useEffect(() => {

        if((props.onChange != null)){
            props.onChange(table);
        }

    },[table])

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
    
        console.log(token)
    
        return token;
    };

    //async function to fetch the table's columns
    async function fetchColumns() {
    
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`, {
            credentials: "include",
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: props.databaseServerID,
                schema: "sakila",
                table: table.name
            })
        });

        let json = await response.json();

        if(response.ok){
            //set the databases hook
            setAllColumns(json.data);
        }
        else{
        
            if(json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }
      
        }

    }

    //helper function called when a column is selected or deselected in the column DropdownMenu
    function handleColumnSelection(key: any){
        
        //first get the selected column keys
        //for all columns selected in the table data model, get only the names as the selected keys
        const selectedColumnKeys = table.columns.map(column => column.name);

        //if the column is already selected, remove it from the data model
        if(selectedColumnKeys.includes(key)){
            //use filter to get a new column array with the column removed
            const newColumnArray = table.columns.filter(column => {return column.name !== key;})
            //update the data model with the new column array
            setTable((previousTableState) => {
                return {...previousTableState, columns: newColumnArray}
            });
        }
        //otherwise, add the column to the data model
        else{
            //create a new column to add to the data model
            const newColumn: column = {name: key};
            //create a new column array with the new column added
            //update the data model with the new column array
            setTable((previousTableState) => {
                return {...previousTableState, columns: previousTableState.columns.concat(newColumn)};
            });
        }

    }

    //callback function for ColumnChip
    function updateColumns(updatedColumn: column, key: React.Key){

        // Find the index of the column to be updated
        const columnIndex = table.columns.findIndex((col) => col.name === key);

        const updatedColumns = [...table.columns];
        updatedColumns[columnIndex] = updatedColumn;
        setTable((previousTableState) => {
            return {...previousTableState, columns: updatedColumns}
        });

    }

    return(
        <div className="w-full">
            <h2>Select the columns to display from {table.name}:</h2>
            <Spacer y={2}/>
            <Card className="overflow-visible">
                <CardBody className="overflow-visible">
                    <div className="flex items-center space-x-2">
                        {table.columns.map((column) => <ColumnChip column={column} key={column.name} onChange={updateColumns}></ColumnChip>)}
                        <div className="flex justify-end flex-1">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button aria-label="addColumn" variant="bordered">+</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    aria-label="Multiple column selection"
                                    variant="flat"
                                    items={allColumns}
                                    closeOnSelect={false}
                                    selectionMode="multiple"
                                    selectedKeys={
                                        //for all columns selected in the table data model, get only the names as the selected keys
                                        table.columns.map(column => column.name)
                                    }
                                    onAction={handleColumnSelection}
                                >
                                    {(item) => (
                                        <DropdownItem key={item.name}>
                                            {item.name}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

}