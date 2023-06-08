import React, { useEffect } from "react";
import "../styles/pages/AccountPage.css";
import { ToastContainer } from "react-toastify";
import { AccountDetails } from "../components/AccountDetails";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";
import UsersService from "../services/UsersService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export function AccountPage() {
    const usersService = new UsersService({ dispatch: useDispatch() });
    const navigate = useNavigate();
    const accessToken = useSelector((state) => state.accessToken);
    const username = useSelector((state) => state.username);
    const param = useParams();
    const routeUsername = param.username;

    useEffect(() => {
        if (
            accessToken === null ||
            !usersService.validateTokenExpiry(accessToken)
        ) {
            navigate("/login");
        }

        if (routeUsername !== username) {
            navigate("/user/" + username);
        }
    }, [accessToken, navigate, usersService]);

    return (
        <>
            <div className="account-page-wrapper">
                <MenuComponent />
                <div className="account-page-content">
                    <TopBar />
                    <div className="page-navigation">
                        <span>
                            <a href="/">
                                <i class="fa-solid fa-house"></i>
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
