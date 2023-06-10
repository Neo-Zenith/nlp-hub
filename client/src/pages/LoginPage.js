import { useEffect, useMemo } from "react";
import "../styles/pages/LoginPage.css";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../services/UIServices";
import LoginForm from "../components/forms/LoginForm";
import { useNavigate } from "react-router-dom";
import UsersService from "../services/UsersService";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const error = useSelector((state) => state.error);
    const accessToken = useSelector((state) => state.accessToken);
    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    });
    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    });

    useEffect(() => {
        if (accessToken && usersService.validateTokenExpiry(accessToken)) {
            navigate("/");
        }
    }, [accessToken]);

    useEffect(() => {
        uiService.displayErrorMsg(error);
    }, [error]);

    return (
        <>
            <div className="login-form-wrapper">
                <LoginForm />
            </div>
        </>
    );
}
