import { useEffect, useMemo } from "react";
import SignupForm from "../components/forms/SignupForm";
import "../styles/pages/SignupPage.css";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../services/UIServices";
import UsersService from "../services/UsersService";
import { useNavigate } from "react-router-dom";

export function SignupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const error = useSelector((state) => state.error);
    const accessToken = useSelector((state) => state.accessToken);

    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    });
    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    });

    useEffect(() => {
        if (accessToken && usersService.validateTokenExpiry(accessToken)) {
            navigate("/");
        }
    }, [accessToken, usersService]);

    useEffect(() => {
        uiServices.displayErrorMsg(error);
    }, [error]);

    return (
        <>
            <div className="signup-form-wrapper">
                <SignupForm />
            </div>
        </>
    );
}
