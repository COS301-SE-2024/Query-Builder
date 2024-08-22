'use client';
import SignedInHomePage from '@/components/SignedInHomePage/SignedInHomePage';
import Sidebar from "../components/SideBar/SideBar";
import toast, { Toaster } from 'react-hot-toast';


export default function Page() {
  return (
  <>
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
            theme: {
                primary: 'green',
                secondary: 'black',
            },
            },
        }}/>
    <Sidebar/> 
    <SignedInHomePage />
  </div>
  </>);
}
