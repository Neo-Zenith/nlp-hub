import React from "react";
import { LoginComponent } from "../components/CredentialsForm";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";

export function LoginPage() {
    return (
        <>
            <div className="login-page-wrapper">
                <LoginComponent className="login-component" />
                <ToastContainer position="top-right" hideProgressBar="true" />
            </div>
        </>
    );
}
