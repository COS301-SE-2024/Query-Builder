"use client"
import OrganisationManagement from "@/components/OrganisationManagement/OrganisationManagement";
import { useState } from "react";
import Sidebar from "@/components/SideBar/SideBar";
import toast, { Toaster } from 'react-hot-toast';

export default function QueryBuilder() {
    return(
      <div className="full-application">
        <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
            // Define default options
            className: '',
            duration: 5000,
            style: {
            background: '#363636',
            color: '#fff',
            },

            // Default options for specific types
            success: {
            duration: 3000,
            iconTheme: {
                primary: 'green',
                secondary: 'black',
            },
            },
        }}/>
        <Sidebar/>
        <OrganisationManagement/>
      </div>
    ) ;
}