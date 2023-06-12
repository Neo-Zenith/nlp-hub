import React, { useEffect, useState } from "react";
import SideBar from "../components/menus/SideBar";
import TopBar from "../components/menus/TopBar";
import UpdateAccount from "../components/sections/UpdateAccount";
import ViewSubscription from "../components/sections/ViewSubscription";
import "../styles/pages/AccountDetailsPage.css";

export default function AccountDetailsPage() {
    const [activeOption, setActiveOption] = useState("updateAccount");

    const handleOptionClick = (option) => {
        setActiveOption(option);
    };

    useEffect(() => {
        if (activeOption === "updateAccount") {
            document
                .getElementById("view-subscription-wrapper")
                .classList.remove("fade-in");
            document
                .getElementById("view-subscription-wrapper")
                .classList.add("fade-out");
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
            document
                .getElementById("view-subscription-wrapper")
                .classList.remove("fade-out");
            document
                .getElementById("view-subscription-wrapper")
                .classList.add("fade-in");
        }
    });

    return (
        <div className="container">
            <div className="sidebar-wrapper">
                <SideBar />
            </div>
            <div className="top-bar-wrapper">
                <TopBar />
            </div>
            <div className="content-wrapper">
                <div className="options">
                    <button
                        className={
                            activeOption === "updateAccount" ? "active" : ""
                        }
                        onClick={() => handleOptionClick("updateAccount")}
                    >
                        Update Account
                    </button>
                    <button
                        className={
                            activeOption === "viewSubscription" ? "active" : ""
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
                        <UpdateAccount />
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
