import React from "react";
import "../styles/pages/AccountPage.css";
import { ToastContainer } from "react-toastify";
import { AccountDetails } from "../components/AccountDetails";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";

export function AccountPage() {
    return (
        <>
            <div className="account-page-wrapper">
                <MenuComponent />
                <div className="account-page-content">
                    <TopBar />
                    <AccountDetails />
                </div>
                <ToastContainer
                    limit={3}
                    autoClose={3500}
                    position="top-right"
                    hideProgressBar="true"
                    toastStyle={{
                        fontFamily: "Quicksand",
                        fontWeight: "400",
                        fontSize: "0.7rem",
                        border: "0.05rem solid var(--color-primary-red)",
                        borderRadius: "0.5rem",
                    }}
                />
            </div>
        </>
    );
}
