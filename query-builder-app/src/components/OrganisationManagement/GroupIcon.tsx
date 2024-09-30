import React from "react";
export const GroupIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40" {...props}>
        <circle cx="50" cy="50" r="10" stroke="black" stroke-width="2" fill="none"/>
        <path d="M 40 65 Q 50 58 60 65" stroke="black" stroke-width="2" fill="none"/>

        <circle cx="30" cy="40" r="8" stroke="black" stroke-width="2" fill="none"/>
        <path d="M 22 52 Q 30 48 38 52" stroke="black" stroke-width="2" fill="none"/>

        <circle cx="70" cy="40" r="8" stroke="black" stroke-width="2" fill="none"/>
        <path d="M 62 52 Q 70 48 78 52" stroke="black" stroke-width="2" fill="none"/>
    </svg>
);