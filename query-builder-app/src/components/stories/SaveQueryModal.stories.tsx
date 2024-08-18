// import the component you want to make a story for
import React from "react";
import SaveQueryModal from "../SaveQueryModal/SaveQueryModal";
import { Query } from "../../interfaces/intermediateJSON";

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: SaveQueryModal
}

const queryProp: Query = {
    databaseServerID: "1234",
    queryParams: {
        language: "sql",
        query_type: "select",
        databaseName: "sakila",
        table: {
            name: "actor",
            columns: [{name: "first_name"}]
        }
    }
}

// Can have multiple different variants of a component
export const DefaultSaveQueryModal = {

    render: () => <SaveQueryModal query={queryProp}/> // this function specifies how we want to render this variant of the component

};