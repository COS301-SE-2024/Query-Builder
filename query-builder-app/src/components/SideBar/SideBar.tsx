import React, { useState } from 'react';
import "./SideBar.css";
import {LogoIcon} from "./Logo";
import Link from 'next/link';
import { createClient } from "./../../utils/supabase/client";
import {Button, useRadioGroup} from "@nextui-org/react";
import { useRouter } from 'next/navigation'
import ContextMenu from "../ContextMenu/ContextMenu";	

const Sidebar = () => {
  // State to manage the open/close state of the sidebar
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

    
    const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        console.log(error);
        router.push("/");
    }

  return (
    <>
        <div className="sidebar-container">
            {/* Header */}
            <div className="sidebar-header">
                <div className="logo">
                    <LogoIcon/>
                </div>
                <div className='logo-title'>
                    QBEE
                </div>
            </div>
            <hr className="sidebar-separator"></hr>
            {/* Navigation */}
            <div className="sidebar-nav">
                <nav className="nav-links">
                    <div className="sidebar-item">
                        <Link href="/" data-testid="homeNav">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Home</span>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Context Menu */}
            <ContextMenu/>

            {/* Footer */}
            <div className="sidebar-footer">
                <hr className="sidebar-separator"></hr>
                <nav className="nav-links">

                    <div className="sidebar-item">
                        <Link href="/settings" data-testid="settingsNav">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Settings</span>
                        </Link>
                    </div>
                    <div className="sidebar-item">
                        <a target="_blank" data-testid="helpNav" href="https://cos301-se-2024.github.io/Query-Builder/docs/category/user-manual">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Help</span>
                        </a>
                    </div>
                    <div className="sidebar-item">
                        <Link href="/authentication" className="logoutButton" data-testid="logoutNav">
                            <Button 
                                variant="solid" 
                                color="danger" 
                                isLoading={loading}
                                onClick={() => signOut()}
                                spinner={
                                    <svg
                                      className="animate-spin h-5 w-5 text-current"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                }
                            >
                                Log out
                            </Button>
                        </Link>
                        
                    </div>
                </nav>
            </div>
        </div>
    </>
  );
};

export default Sidebar;