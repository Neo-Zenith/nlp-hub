import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/menus/TopBar.css";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarActive } from "../../store/actions";

export default function TopBar() {
    const dispatch = useDispatch();

    const username = useSelector((state) => state.username);
    const sideBarActive = useSelector((state) => state.sideBarActive);

    const [windowWidth, setWindowWidth] = useState(null);

    function handleSidebarFade() {
        var body = document.body;
        var sidebarContainer = document.getElementById("sidebar-container");

        if (!sideBarActive) {
            body.classList.add("lock-scroll");
            sidebarContainer.classList.remove("sidebar-fade-out");
            sidebarContainer.classList.add("sidebar-fade-in");
            dispatch(setSidebarActive(true));
        } else {
            body.classList.remove("lock-scroll");
            sidebarContainer.classList.remove("sidebar-fade-in");
            sidebarContainer.classList.add("sidebar-fade-out");
            dispatch(setSidebarActive(false));
        }
    }

    function handleDisplayCollapseBtn() {
        if (window.innerWidth > 1020) {
            document.getElementById("cancel-btn").style.display = "none";
        } else {
            document.getElementById("cancel-btn").style.display = "block";
        }
    }

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
            handleDisplayCollapseBtn();
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        handleDisplayCollapseBtn();
    }, [windowWidth]);

    return (
        <>
            <div className="topbar-container">
                {windowWidth < 1020 && !sideBarActive && (
                    <button onClick={handleSidebarFade} id="hamburger-btn">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                )}
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
