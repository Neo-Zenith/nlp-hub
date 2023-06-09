import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";
import "../styles/pages/DashboardPage.css";
import { useNavigate } from "react-router-dom";
import UsersService from "../services/UsersService";
import { UIService } from "../services/UIServices";

export function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);
    const error = useSelector((state) => state.error);

    useEffect(() => {
        if (
            accessToken === null ||
            !usersService.validateTokenExpiry(accessToken)
        ) {
            const error = "Session expired. Please login again.";
            uiServices.setErrorMsg(error);
            navigate("/login");
        }
    }, [accessToken, navigate, usersService, uiServices]);

    useEffect(() => {
        if (error !== null) {
            uiServices.displayErrorMsg(error);
        }
    }, [error, uiServices]);

    return (
        <>
            <div className="dashboard-wrapper">
                <MenuComponent />
                <TopBar />
            </div>
        </>
    );
}
