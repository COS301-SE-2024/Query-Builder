// import the component you want to make a story for
import React from "react";
import FilterChip from "../FilterChip/FilterChip";
import {primitiveCondition, ComparisonOperator} from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: FilterChip
}

const primitiveConditionProp: primitiveCondition = {
    column: "salary",
    operator: ComparisonOperator.GREATER_THAN,
    value: 20000
}

// Can have multiple different variants of a component
export const DefaultFilterChip = {

    render: () => <FilterChip primitiveCondition={primitiveConditionProp}/> // this function specifies how we want to render this variant of the component

};