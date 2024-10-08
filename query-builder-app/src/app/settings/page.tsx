"use client"
import UserSettings from "@/components/UserSettings/UserSettings";
import Sidebar from "../../components/SideBar/SideBar";
import toast, { Toaster } from 'react-hot-toast';

export default function Settings() {

  return (
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
            color: '#000',
            background: '#fff',
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }} />
      <Sidebar />
      <div className="app">
        <UserSettings />
      </div>
    </div>
  );
}
