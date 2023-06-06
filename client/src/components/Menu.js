import { useDispatch, useSelector } from "react-redux";
import UsersService from "../services/UsersService";

export function MenuComponent() {
    const username = useSelector((state) => state.username);
    const userService = new UsersService({ dispatch: useDispatch() });
    const handleLogout = (e) => {
        userService.logoutUser();
    };

    return (
        <>
            <div className="menu-container">
                <div className="menu-header">{username}</div>
                <div className="menu-section">
                    <div className="section-title">Services</div>
                    <ul className="section-list"></ul>
                </div>
                <div className="menu-section">
                    <div className="section-title">Usages</div>
                    <ul className="section-list"></ul>
                </div>

                <button onClick={handleLogout}>Logout</button>
            </div>
        </>
    );
}
