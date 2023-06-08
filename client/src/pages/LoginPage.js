import React, { useEffect } from "react";
import { LoginComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const accessToken = useSelector((state) => state.accessToken);
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken, navigate]);

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
