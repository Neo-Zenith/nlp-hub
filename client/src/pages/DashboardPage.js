import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";
import "../styles/pages/DashboardPage.css";
import { useNavigate } from "react-router-dom";
import UsersService from "../services/UsersService";

export function DashboardPage() {
    const accessToken = useSelector((state) => state.accessToken);
    const navigate = useNavigate();
    const usersService = new UsersService({ dispatch: useDispatch() });

    useEffect(() => {
        if (
            accessToken === null ||
            !usersService.validateTokenExpiry(accessToken)
        ) {
            navigate("/login");
        }
    }, [accessToken, navigate, usersService]);

    return (
        <>
            <div className="dashboard-wrapper">
                <MenuComponent />
                <TopBar />
            </div>
        </>
    );
}
