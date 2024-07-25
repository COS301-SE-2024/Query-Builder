// import the component you want to make a story for
import React from "react";
import ColumnChip from "../ColumnChip/ColumnChip";
import {column} from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: ColumnChip
}

const columnProp: column = {
    name: "first_name"
}

// Can have multiple different variants of a component
export const DefaultColumnChip = {

    render: () => <ColumnChip column={columnProp}/> // this function specifies how we want to render this variant of the component

};