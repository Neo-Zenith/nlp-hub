import React, { useEffect, useMemo } from "react";
import { LoginComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UIService } from "../services/UIServices";

export function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);
    const error = useSelector((state) => state.error);

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken, navigate]);

    useEffect(() => {
        if (error !== null) {
            uiServices.displayErrorMsg(error);
        }
    }, [error, uiServices]);

    return (
        <>
            <div className="login-page-wrapper">
                <div className="login-container-wrapper">
                    <img className="login-bg" src={bg} />
                    <div className="login-component">
                        <LoginComponent />
                    </div>
                </div>
            </div>
        </>
    );
}
