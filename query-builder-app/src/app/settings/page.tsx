"use client"
import UserSettings from "@/components/UserSettings/UserSettings";
import Sidebar from "../../components/SideBar/SideBar";

export default function Settings() {

    return(
      <div className="full-application">
        <Sidebar/>
        <div className="app">
            <UserSettings/>
        </div>
      </div>
    ) ;
}
