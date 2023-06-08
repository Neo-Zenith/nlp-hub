import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UsersService from "../services/UsersService";
import "../styles/components/Menu.css";
import { useEffect } from "react";

export function MenuComponent() {
    const username = useSelector((state) => state.username);
    const navigate = useNavigate();
    const userService = new UsersService({ dispatch: useDispatch() });
    const handleLogout = (e) => {
        const response = userService.logoutUser();
        if (response) {
            navigate("/login");
        }
    };

    return (
        <>
            <div className="menu-container">
                <div className="menu-header">
                    <div className="menu-welcome-text">
                        <span>Welcome back</span>
                        <span className="username">{username}</span>
                    </div>
                    <div className="menu-title">
                        <span> Dashboard </span>
                    </div>
                </div>
                <div className="menu-sections">
                    <div className="menu-section">
                        <div className="section-title">Services</div>
                        <ul className="section-list">
                            <li>
                                <button>
                                    <i className="fa-solid fa-list"></i> &nbsp;
                                    Available Services
                                </button>
                            </li>
                            <li>
                                <button>
                                    <i className="fa-solid fa-comment"></i>{" "}
                                    &nbsp; Query Service
                                </button>
                            </li>
                            <li>
                                <button>
                                    <i className="fa-solid fa-circle-info"></i>{" "}
                                    &nbsp; Service Details
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="menu-section">
                        <div className="section-title">Usages</div>
                        <ul className="section-list">
                            <li>
                                <button>
                                    <i className="fa-sharp fa-solid fa-clock-rotate-left"></i>{" "}
                                    &nbsp; Retrieve Usages
                                </button>
                            </li>
                            <li>
                                <button>
                                    <i className="fa-solid fa-chart-pie"></i>{" "}
                                    &nbsp; Usage Statistics
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="menu-footer">
                    <span>{new Date().toDateString()}</span>
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        </>
    );
}
