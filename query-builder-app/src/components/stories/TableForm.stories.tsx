// import the component you want to make a story for
import React from "react";
import TableForm from "../TableForm/TableForm";
import { table } from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: TableForm
}

const tableProp: table = {
    name: "actor",
    columns: []
}


// Can have multiple different variants of a component
export const DefaultTableForm = {

    render: () => <TableForm databaseServerID="mockServerID" table={tableProp}/> // this function specifies how we want to render this variant of the component

};