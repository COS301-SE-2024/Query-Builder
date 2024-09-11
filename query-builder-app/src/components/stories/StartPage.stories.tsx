// import the component you want to make a story for
import React from "react";
import StartPage from "../LandingPage/StartPage"

export default {
    component: StartPage
}

// Can have multiple different variants of a component
export const DefaultStartPage = {

    render: () => <StartPage/> 

};