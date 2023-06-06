import React from "react";
import { SignupComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";

export function SignupPage() {
    return (
        <>
            <div className="signup-page-wrapper">
                <div className="signup-container-wrapper">
                    <img className="signup-bg" src={bg} />
                    <div className="signup-component">
                        <SignupComponent />
                    </div>
                </div>
                <ToastContainer
                    limit={3}
                    autoClose={3500}
                    position="top-right"
                    hideProgressBar="true"
                    toastStyle={{
                        fontFamily: "Poppins",
                        fontWeight: "400",
                        fontSize: "0.7rem",
                        background: "var(--tertiary-red)",
                        border: "0.05rem solid var(--primary-red)",
                        borderRadius: "0.5rem",
                    }}
                />
            </div>
        </>
    );
}
