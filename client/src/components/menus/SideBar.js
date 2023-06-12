import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/menus/SideBar.css";
import { useDispatch, useSelector } from "react-redux";
import UsersService from "../../services/UsersService";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
    const username = useSelector((state) => state.username);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);

    const [sidebarActive, setSidebarActive] = useState(false);
    const [windowWidth, setWindowWidth] = useState(null);
    const [windowHeight, setWindowHeight] = useState(null);

    function handleSidebarFade() {
        if (!sidebarActive) {
            document
                .getElementById("sidebar-container")
                .classList.remove("sidebar-fade-out");
            document
                .getElementById("sidebar-container")
                .classList.add("sidebar-fade-in");
            setSidebarActive(true);
        } else {
            document
                .getElementById("sidebar-container")
                .classList.remove("sidebar-fade-in");
            document
                .getElementById("sidebar-container")
                .classList.add("sidebar-fade-out");
            setSidebarActive(false);
        }
    }

    function handleDisplayCollapseBtn() {
        if (window.innerWidth > 1020) {
            document.getElementById("cancel-btn").style.display = "none";
        } else {
            document.getElementById("cancel-btn").style.display = "block";
        }
    }

    function handleLogout() {
        usersService.logoutUser();
        navigate("/login");
    }

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
            setWindowHeight(document.documentElement.scrollHeight);
            handleDisplayCollapseBtn();
        }

        window.addEventListener("resize", handleResize);
        document.getElementById("sidebar-container").style.height =
            document.documentElement.scrollHeight.toString() + "px";
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        handleDisplayCollapseBtn();
    }, [windowWidth]);

    useEffect(() => {
        document.getElementById("sidebar-container").style.height =
            document.documentElement.scrollHeight.toString() + "px";
    }, [windowHeight]);

    return (
        <>
            {windowWidth < 1020 && !sidebarActive && (
                <button onClick={handleSidebarFade} id="hamburger-btn">
                    <i className="fa-solid fa-bars"></i>
                </button>
            )}
            <div id="sidebar-container" className="sidebar-container">
                <button onClick={handleSidebarFade} id="cancel-btn">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="welcome-title">Welcome back</span>
                <span className="sidebar-username">{username}</span>
                <span className="dashboard-title">Dashboard</span>
                <div className="sidebar-navigation">
                    <div className="nav-section">
                        <span>Services</span>
                        <ul>
                            <li>
                                <a onClick={handleSidebarFade} href="/services">
                                    <i className="fa-solid fa-list"></i>
                                    &nbsp;&nbsp;&nbsp;Available Services
                                </a>
                            </li>
                            <li>
                                <a onClick={handleSidebarFade} href="/">
                                    <i className="fa-solid fa-comment"></i>
                                    &nbsp;&nbsp;&nbsp;Query Service
                                </a>
                            </li>
                            <li>
                                <a onClick={handleSidebarFade} href="/">
                                    <i className="fa-solid fa-circle-info"></i>
                                    &nbsp;&nbsp;&nbsp;Service Details
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="nav-section">
                        <span>Usages</span>
                        <ul>
                            <li>
                                <a onClick={handleSidebarFade} href="/">
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                    &nbsp;&nbsp;&nbsp;Usage History
                                </a>
                            </li>
                            <li>
                                <a onClick={handleSidebarFade} href="/">
                                    <i className="fa-solid fa-circle-info"></i>
                                    &nbsp;&nbsp;&nbsp;Usage Details
                                </a>
                            </li>
                            <li>
                                <a onClick={handleSidebarFade} href="/">
                                    <i className="fa-solid fa-chart-line"></i>
                                    &nbsp;&nbsp;&nbsp;Statistics
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <span>{new Date().toDateString()}</span>
                    <button onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        </>
    );
}