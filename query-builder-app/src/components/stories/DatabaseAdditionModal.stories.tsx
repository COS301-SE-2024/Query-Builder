// import the component you want to make a story for
import React from "react";
import DatabaseAdditionModal from "../DatabaseAdditionModal/DatabaseAdditionModal"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: DatabaseAdditionModal
}


// Can have multiple different variants of a component
export const DefaultDatabaseAdditionModal = {

    render: () => <DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/> // this function specifies how we want to render this variant of the component

};