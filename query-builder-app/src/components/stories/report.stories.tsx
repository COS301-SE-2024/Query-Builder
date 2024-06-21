// import the component you want to make a story for
import React from "react";
import "../../app/globals.css";
import Report from "../report/report";

// Setting up the story's default component
export default {
    component: Report
}

// Can have multiple different variants of a component
export const DefaultReport = {
    render: () => <Report tableData={undefined}/>
};