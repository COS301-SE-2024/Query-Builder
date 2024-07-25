// import the component you want to make a story for
import React from "react";
import TableList from "../TableList/TableList";
import { table } from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: TableList
}

const tableProp: table = {
    name: "actor",
    columns: [],
    join: {
        table1MatchingColumnName: "id",
        table2MatchingColumnName: "id",
        table2: {
            name: "film",
            columns: []
        }
    }
}


// Can have multiple different variants of a component
export const DefaultTableList = {

    render: () => <TableList table={tableProp}/> // this function specifies how we want to render this variant of the component

};