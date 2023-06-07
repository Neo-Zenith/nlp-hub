import React, { useState } from "react";
import "../styles/components/TopBar.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function TopBar() {
    const [searchString, setSearchString] = useState("");
    const navigate = useNavigate();
    const username = useSelector((state) => state.username);

    const handleSearchStringChange = (e) => {
        setSearchString(e.target.value);
    };

    const handleRedirectProfile = (e) => {
        navigate("/user/" + username);
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
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                </div>
                <div className="settings">
                    <ul className="settings-list">
                        <li>
                            <button onClick={handleRedirectProfile}>
                                <i className="fa-solid fa-user"></i>
                            </button>
                        </li>
                        <li>
                            <button>
                                <i className="fa-solid fa-gear"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
