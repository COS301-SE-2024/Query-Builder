'use client';
import LandingPage from '@/components/LandingPage/StartPage';
import { Toaster } from 'react-hot-toast';

export default function Auth() {
  
  return (
    <>
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
    }}/>
    <LandingPage />
  </>);
}
