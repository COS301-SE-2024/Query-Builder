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
    
    const signOut = async () => {
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
            <div className = "sidebar-item">
                    <ContextMenu/>
            </div>

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
                        <Button variant="solid" color="danger"
                         onClick={() => signOut()}>
                            Log out
                        </Button>
                    </div>
                </nav>
            </div>
        </div>
    </>
  );
};

export default Sidebar;