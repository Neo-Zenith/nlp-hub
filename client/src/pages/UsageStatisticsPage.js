import React, { useEffect, useMemo, useState } from "react";
import SideBar from "../components/menus/SideBar";
import UIService from "../services/UIServices";
import "../styles/pages/UsageStatisticsPage.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UsersService from "../services/UsersService";
import TopBar from "../components/menus/TopBar";
import UsageTimeStats from "../components/sections/UsageTimeStats";
import QuickNavigation from "../components/sections/QuickNavigation";

export default function UsageStatisticsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const accessToken = useSelector((state) => state.accessToken);
    const error = useSelector((state) => state.error);

    const [activeChart, setActiveChart] = useState("Usage Trend");

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);
    const usersSerivce = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);

    useEffect(() => {
        if (accessToken === null) {
            navigate("/login");
        } else if (!usersSerivce.validateTokenExpiry(accessToken)) {
            uiService.setErrorMsg("Session expired. Please login again.");
            navigate("/login");
        }
    }, [accessToken, uiService, usersSerivce, navigate]);

    useEffect(() => {
        if (error !== null) {
            uiService.displayErrorMsg(error);
        }
    }, [error, uiService]);

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
                    current="Usage Statistics"
                    url={window.location.href}
                />
            </div>
            <div className="usage-stats-wrapper">
                {activeChart === "Usage Trend" && (
                    <div className="usage-time-stats-wrapper">
                        <UsageTimeStats
                            onChangeChart={(value) => setActiveChart(value)}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
