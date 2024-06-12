"use client";
import "../../app/globals.css";
import "./LandingPage.css";
import React from "react";
import Authentication from "../Authentication/Authentication";

export default function LandingPage() {
    return (
        <div className="backgroundStyle">
            <div className="container">
                <div className="content">
                    <h1 className="mainTitle">Welcome to QBee</h1>
                </div>
                <Authentication />
            </div>
        </div>
    );
}