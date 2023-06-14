import React from "react";
import ServicesList from "../components/sections/ServiceList";
import "../styles/pages/ServiceDetailsPage.css";
import TopBar from "../components/menus/TopBar.js";
import SideBar from "../components/menus/SideBar.js";
import QuickNavigation from "../components/sections/QuickNavigation";

export default function ServiceDetailsPage() {
    return (
        <>
            <div id="sidebar-wrapper" className="sidebar-wrapper">
                <SideBar />
            </div>
            <div className="top-bar-wrapper">
                <TopBar />
            </div>
            <div className="quick-nav-wrapper">
                <QuickNavigation
                    current="Services"
                    url={window.location.href}
                />
            </div>
            <div className="service-list-wrapper">
                <ServicesList />
            </div>
        </>
    );
}
