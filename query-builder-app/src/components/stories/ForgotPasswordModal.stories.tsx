// import the component you want to make a story for
import React from "react";
import "../../app/globals.css"
import ForgotPasswordModal from '../ForgotPasswordModal/ForgotPasswordModal';

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: ForgotPasswordModal
}


// Can have multiple different variants of a component
export const DefaultForm = {

    render: () => <ForgotPasswordModal isOpen={false} onClose={function (): void {
        throw new Error("Function not implemented.");
    } } onSubmit={function (email: string): void {
        throw new Error("Function not implemented.");
    } }/> // this function specifies how we want to render this variant of the component

};