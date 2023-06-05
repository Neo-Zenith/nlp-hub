import React from "react";
import { SignupComponent } from "../components/CredentialsForm";
import "../styles/pages/CredentialsPage.css";

export function SignupPage() {
    return (
        <>
            <div className="signup-page-wrapper">
                <SignupComponent className="signup-component" />
            </div>
        </>
    );
}
