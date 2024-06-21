// import the component you want to make a story for
import React from "react";
// import "../../app/globals.css";
import SideBar from "../SideBar/SideBar";

// Setting up the story's default component
export default {
    component: SideBar
}

// Can have multiple different variants of a component
export const DefaultSideBar = {
    render: () => <SideBar/>
};