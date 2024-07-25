import {table} from "../../interfaces/intermediateJSON"
import React, { useState } from "react";
import TableForm from "../TableForm/TableForm"

interface TableListProps {
    table: table
}

export default function TableList(props: TableListProps){

    const [table, setTable] = useState<table>(props.table);

    //create an array of TableForms
    const tableForms: React.JSX.Element[] = [];

    //create a table reference
    let tableRef = table;

    //add the TableForm for the first (compulsory) table
    tableForms.push(<TableForm table={tableRef} ></TableForm>)

    //iterate over the linked list of joined tables
    while(tableRef.join != null){
        tableRef = tableRef.join.table2;
        //add the TableForm for the next table
        tableForms.push(<TableForm table={tableRef} ></TableForm>)
    }

    return(
        <div className="flex space-x-4">
            {tableForms}
        </div>
    );

}