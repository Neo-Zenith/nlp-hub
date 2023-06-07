import React, { useState } from "react";
import "../styles/components/TopBar.css";

export function TopBar() {
    const [searchString, setSearchString] = useState("");

    const handleSearchStringChange = (e) => {
        setSearchString(e.target.value);
    };

    return (
        <>
            <div className="top-bar-container">
                <div className="search-bar">
                    <input
                        type="text"
                        onChange={handleSearchStringChange}
                        placeholder="Search"
                    />
                    <span>
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </span>
                </div>
                <div className="settings">
                    <ul className="settings-list">
                        <li>
                            <button>
                                <i class="fa-solid fa-user"></i>
                            </button>
                        </li>
                        <li>
                            <button>
                                <i class="fa-solid fa-gear"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
