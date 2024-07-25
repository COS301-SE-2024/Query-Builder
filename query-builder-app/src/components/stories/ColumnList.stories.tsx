// import the component you want to make a story for
import React from "react";
import ColumnList from "../ColumnList/ColumnList";
import {column} from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: ColumnList
}

const columnListProp: column[] = [{name: "first_name"}, {name: "last_name"}, {name: "id"}, {name: "salary"}]


// Can have multiple different variants of a component
export const DefaultColumnList = {

    render: () => <ColumnList columns={columnListProp} /> // this function specifies how we want to render this variant of the component

};