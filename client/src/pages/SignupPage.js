import React, { useEffect } from "react";
import { SignupComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function SignupPage() {
    const accessToken = useSelector((state) => state.accessToken);
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken, navigate]);

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
