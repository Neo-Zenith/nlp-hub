import React, { useEffect, useMemo } from "react";
import "../styles/pages/AccountPage.css";
import { AccountDetails } from "../components/AccountDetails";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";
import UsersService from "../services/UsersService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { UIService } from "../services/UIServices";

export function AccountPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);
    const username = useSelector((state) => state.username);
    const error = useSelector((state) => state.error);

    const param = useParams();
    const routeUsername = param.username;

    useEffect(() => {
        if (
            accessToken === null ||
            !usersService.validateTokenExpiry(accessToken)
        ) {
            const error = "Session expired. Please login again.";
            uiServices.setErrorMsg(error);
            navigate("/login");
        }

        if (routeUsername !== username) {
            navigate("/user/" + username);
        }
    }, [
        accessToken,
        routeUsername,
        username,
        navigate,
        usersService,
        uiServices,
    ]);

    useEffect(() => {
        if (error !== null) {
            uiServices.displayErrorMsg(error);
        }
    }, [error, uiServices]);

    return (
        <>
            <div className="account-page-wrapper">
                <MenuComponent />
                <div className="account-page-content">
                    <TopBar />
                    <div className="page-navigation">
                        <span>
                            <a href="/">
                                <i className="fa-solid fa-house"></i>
                            </a>
                        </span>
                        &nbsp;/&nbsp;
                        <span>
                            <a href={"/user/" + username}>Profile details</a>
                        </span>
                    </div>
                    <div className="account-details">
                        <AccountDetails />
                    </div>
                </div>
            </div>
        </>
    );
}
