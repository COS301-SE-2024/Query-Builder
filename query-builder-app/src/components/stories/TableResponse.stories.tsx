// import the component you want to make a story for
import React from "react";
import TableResponse from "../TableResponse/TableResponse"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: TableResponse
}


// Can have multiple different variants of a component
export const DefaultTableResponse = {

    render: () => <TableResponse query={{
        databaseServerID: "mockServerID",
        queryParams: {
            databaseName: "sakila",
            language: "sql",
            query_type: "select",
            table: {
                name: "film",
                columns: [{name: "title"}, {name:"release_year"}, {name:"rating"}, {name:"rental_rate"}, {name:"rental_duration"}, {name:"language_id"}],
            },
        }
    }}/> // this function specifies how we want to render this variant of the component

};