import React from "react";
import SideBar from "../components/menus/SideBar";
import "../styles/pages/DashboardPage.css";

export default function DashboardPage() {
    return (
        <>
            <div className="sidebar-wrapper">
                <SideBar />
            </div>
        </>
    );
}
