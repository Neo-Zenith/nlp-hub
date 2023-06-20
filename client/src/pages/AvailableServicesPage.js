import React, { useEffect, useMemo } from "react";
import ServicesList from "../components/sections/ServiceList";
import "../styles/pages/AvailableServicesPage.css";
import TopBar from "../components/menus/TopBar.js";
import SideBar from "../components/menus/SideBar.js";
import QuickNavigation from "../components/sections/QuickNavigation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UIService from "../services/UIServices";
import UsersService from "../services/UsersService";

export default function AvailableServicesPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const accessToken = useSelector((state) => state.accessToken);
    const error = useSelector((state) => state.error);

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
                    current="Available Services"
                    url={window.location.href}
                />
            </div>
            <div className="service-list-wrapper">
                <ServicesList />
            </div>
        </>
    );
}
