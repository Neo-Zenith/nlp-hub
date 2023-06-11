import React from "react";
import "../../styles/components/menus/TopBar.css";

export default function TopBar() {
    return (
        <>
            <div className="topbar-container">
                <div className="search-bar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search" />
                </div>
                <div className="topbar-links">
                    <button>
                        <i className="fa-solid fa-user"></i>
                    </button>
                    <button>
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
        </>
    );
}
