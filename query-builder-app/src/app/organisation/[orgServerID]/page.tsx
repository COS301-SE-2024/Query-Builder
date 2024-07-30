"use client"
import OrganisationManagement from "@/components/OrganisationManagement/OrganisationManagement";
import { useState } from "react";
import Sidebar from "@/components/SideBar/SideBar";

export default function QueryBuilder() {
    return(
      <div className="full-application">
        <Sidebar/>
        <OrganisationManagement/>
      </div>
    ) ;
}