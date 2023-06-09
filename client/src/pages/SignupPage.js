import React, { useEffect, useMemo } from "react";
import { SignupComponent } from "../components/CredentialsForm";
import bg from "../img/credential-form-bg.jpg";
import "../styles/pages/CredentialsPage.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UIService } from "../services/UIServices";

export function SignupPage() {
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
            <div className="signup-page-wrapper">
                <div className="signup-container-wrapper">
                    <img className="signup-bg" src={bg} />
                    <div className="signup-component">
                        <SignupComponent />
                    </div>
                </div>
            </div>
        </>
    );
}
