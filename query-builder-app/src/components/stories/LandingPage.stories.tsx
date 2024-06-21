// import the component you want to make a story for
import React from "react";
import "../../app/globals.css";
import LandingPage from "../LandingPage/LandingPage";

// Setting up the story's default component
export default {
    component: LandingPage
}

// Can have multiple different variants of a component
export const DefaultLandingPage = {
    render: () => <LandingPage/>
};