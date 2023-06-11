import React, { useEffect, useMemo } from "react";
import SideBar from "../components/menus/SideBar";
import UIService from "../services/UIServices";
import "../styles/pages/DashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UsersService from "../services/UsersService";
import TopBar from "../components/menus/TopBar";

export default function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const accessToken = useSelector((state) => state.accessToken);

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

    return (
        <>
            <div className="sidebar-wrapper">
                <SideBar />
            </div>
            <div className="top-bar-wrapper">
                <TopBar />
            </div>
        </>
    );
}
