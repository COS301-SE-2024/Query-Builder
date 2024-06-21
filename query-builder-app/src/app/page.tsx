'use client';
import SignedInHomePage from '@/components/SignedInHomePage/SignedInHomePage';
import Sidebar from "../components/SideBar/SideBar";

export default function Page() {
  return (
  <>
  <div className="full-application">
    <Sidebar/> 
    <SignedInHomePage />
  </div>
  </>);
}
