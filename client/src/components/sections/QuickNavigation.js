import React from "react";
import "../../styles/components/sections/QuickNavigation.css";

export default function QuickNavigation({ current, url }) {
    return (
        <>
            <div className="quick-navigation-container">
                <a href="/">
                    <i className="fa-solid fa-house"></i>
                </a>
                &nbsp;&nbsp;<span id="divider">/</span>&nbsp;&nbsp;
                <a href={url}>
                    <span>{current}</span>
                </a>
            </div>
        </>
    );
}
