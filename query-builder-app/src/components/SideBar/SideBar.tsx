import React, { useState } from 'react';
import "./SideBar.css";
import {LogoIcon} from "./Logo";
import Link from 'next/link'


const Sidebar = () => {
  // State to manage the open/close state of the sidebar
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
                        <Link href="/">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Home</span>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <hr className="sidebar-separator"></hr>
                <nav className="nav-links">

                    <div className="sidebar-item">
                        <Link href="/settings">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Settings</span>
                        </Link>
                    </div>
                    <div className="sidebar-item">
                        <a href="">
                            <span className="sidebar-item-icon"></span>
                            <span className="sidebar-item-title">Log out</span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    </>
  );
};

export default Sidebar;