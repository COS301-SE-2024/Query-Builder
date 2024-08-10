// import the component you want to make a story for
import React from "react";
import "../../app/globals.css"
import NaturalLanguage from "../NaturalLanguage/NaturalLanguage";

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: NaturalLanguage
}


// Can have multiple different variants of a component
export const DefaultForm = {

    render: () => <NaturalLanguage/> // this function specifies how we want to render this variant of the component

};