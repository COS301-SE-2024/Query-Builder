// import the component you want to make a story for
import React from "react";
import StartPage from "../LandingPage/StartPage"


// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: StartPage
}


// Can have multiple different variants of a component
export const DefaultStartPage = {

    render: () => <StartPage/> // this function specifies how we want to render this variant of the component

};