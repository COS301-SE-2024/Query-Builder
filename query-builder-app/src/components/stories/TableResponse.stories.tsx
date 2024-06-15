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
        credentials: {
            host: "127.0.0.1",
            user: "root",
            password: "testPassword"
        },
        databaseName: "sakila",
        queryParams: {
            language: "sql",
            query_type: "select",
            table: "film",
            columns: ["title", "release_year", "rating", "rental_rate", "rental_duration", "language_id"],
        }
    }}/> // this function specifies how we want to render this variant of the component

};