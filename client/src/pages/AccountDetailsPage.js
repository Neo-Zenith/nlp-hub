import React, { useEffect, useMemo, useState } from "react";
import SideBar from "../components/menus/SideBar";
import TopBar from "../components/menus/TopBar";
import AccountDetails from "../components/sections/AccountDetails";
import ViewSubscription from "../components/sections/ViewSubscription";
import "../styles/pages/AccountDetailsPage.css";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../services/UIServices";
import QuickNavigation from "../components/sections/QuickNavigation";
import { useNavigate, useParams } from "react-router-dom";
import UsersService from "../services/UsersService";

export default function AccountDetailsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const error = useSelector((state) => state.error);
    const username = useSelector((state) => state.username);
    const accessToken = useSelector((state) => state.accessToken);

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);
    const usersSerivce = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);

    const [activeOption, setActiveOption] = useState("updateAccount");

    const handleOptionClick = (option) => {
        setActiveOption(option);
    };

    useEffect(() => {
        if (error !== null) {
            uiService.displayErrorMsg(error);
        }
    }, [error, uiService]);

    useEffect(() => {
        if (activeOption === "updateAccount") {
            document
                .getElementById("view-subscription-wrapper")
                .classList.remove("fade-in");
            document
                .getElementById("view-subscription-wrapper")
                .classList.add("fade-out");
            document.getElementById("view-subscription-wrapper").style.display =
                "none";
            document.getElementById("update-account-wrapper").style.display =
                "flex";
            document
                .getElementById("update-account-wrapper")
                .classList.remove("fade-out");
            document
                .getElementById("update-account-wrapper")
                .classList.add("fade-in");
        } else {
            document
                .getElementById("update-account-wrapper")
                .classList.remove("fade-in");
            document
                .getElementById("update-account-wrapper")
                .classList.add("fade-out");
            document.getElementById("update-account-wrapper").style.display =
                "none";
            document.getElementById("view-subscription-wrapper").style.display =
                "flex";
            document
                .getElementById("view-subscription-wrapper")
                .classList.remove("fade-out");
            document
                .getElementById("view-subscription-wrapper")
                .classList.add("fade-in");
        }
    });

    useEffect(() => {
        if (params.username !== username) {
            navigate("/" + username);
        }
    }, [params, username, navigate]);

    useEffect(() => {
        if (accessToken === null) {
            navigate("/login");
        } else if (!usersSerivce.validateTokenExpiry(accessToken)) {
            uiService.setErrorMsg("Session expired. Please login again.");
            navigate("/login");
        }
    }, [accessToken, uiService, usersSerivce, navigate]);

    return (
        <div className="container">
            <div id="sidebar-wrapper" className="sidebar-wrapper">
                <SideBar />
            </div>
            <div className="top-bar-wrapper">
                <TopBar />
            </div>
            <div className="quick-nav-wrapper">
                <QuickNavigation current="Profile" url={window.location.href} />
            </div>
            <div className="content-wrapper">
                <div className="options">
                    <button
                        className={
                            activeOption === "updateAccount" ? "active" : ""
                        }
                        onClick={() => handleOptionClick("updateAccount")}
                    >
                        Account Details
                    </button>
                    <button
                        className={
                            activeOption === "updateAccount" ? "" : "active"
                        }
                        onClick={() => handleOptionClick("viewSubscription")}
                    >
                        View Subscription
                    </button>
                </div>
                <div className="component-wrapper">
                    <div
                        id="update-account-wrapper"
                        className="update-account-wrapper"
                    >
                        <AccountDetails />
                    </div>
                    <div
                        id="view-subscription-wrapper"
                        className="view-subscription-wrapper"
                    >
                        <ViewSubscription />
                    </div>
                </div>
            </div>
        </div>
    );
}
