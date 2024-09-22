// import the component you want to make a story for
import React from "react";
import FilterList from "../FilterList/FilterList";
import {primitiveCondition, ComparisonOperator, compoundCondition, LogicalOperator, table} from "../../interfaces/intermediateJSON"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: FilterList
}

const compoundConditionProp: compoundCondition = {
    operator: LogicalOperator.AND,
    conditions: [
        {
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 20000
        },
        {
            column: "age",
            operator: ComparisonOperator.LESS_THAN,
            value: 20
        }
    ]
}

const tableProp: table = {
    name: "actor",
    columns: []
}

// Can have multiple different variants of a component
export const DefaultFilterList = {

    render: () => <FilterList database="sakila" language="mysql" databaseServerID="mockDatabaseServerID" condition={compoundConditionProp} table={tableProp}/> // this function specifies how we want to render this variant of the component

};