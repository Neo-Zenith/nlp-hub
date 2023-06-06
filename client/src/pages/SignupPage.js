import React from "react";
import { SignupComponent } from "../components/CredentialsForm";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";

export function SignupPage() {
    return (
        <>
            <div className="signup-page-wrapper">
                <SignupComponent className="signup-component" />
                <ToastContainer position="top-right" hideProgressBar="true" />
            </div>
        </>
    );
}
