import React from "react";
import { LoginComponent } from "../components/CredentialsForm";
import "../styles/pages/CredentialsPage.css";

export function LoginPage() {
    return (
        <>
            <div className="login-page-wrapper">
                <LoginComponent className="login-component" />
            </div>
        </>
    );
}
