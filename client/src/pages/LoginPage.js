import React from "react";
import { LoginComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";

export function LoginPage() {
    return (
        <>
            <div className="login-page-wrapper">
                <div className="login-container-wrapper">
                    <img className="login-bg" src={bg} />
                    <div className="login-component">
                        <LoginComponent />
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
