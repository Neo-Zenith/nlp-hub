import React from "react";
import "../../styles/components/menus/TopBar.css";
import { useSelector } from "react-redux";

export default function TopBar() {
    const username = useSelector((state) => state.username);

    return (
        <>
            <div className="topbar-container">
                <div className="search-bar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search" />
                </div>
                <div className="topbar-links">
                    <a href={"/" + username}>
                        <i className="fa-solid fa-user"></i>
                    </a>
                    <a>
                        <i className="fa-solid fa-gear"></i>
                    </a>
                </div>
            </div>
        </>
    );
}
