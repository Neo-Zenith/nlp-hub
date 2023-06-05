import React, { useEffect, useState } from "react";
import "../styles/components/CredentialsForm.css";
import { UsersService } from "../services/UsersService";

export function LoginComponent() {
    const usersService = new UsersService();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        usersService.loginUser(username, password);
        setUsername("");
        setPassword("");
    };

    useEffect(() => {
        const handleInputNameStyle = () => {
            if (username !== "") {
                document.getElementById("username-field-name").style.transform =
                    "translate(0, -1rem)";
                document.getElementById(
                    "username-field-input"
                ).style.borderStyle = "solid";
                document.getElementById(
                    "username-field-input"
                ).style.borderWidth = "0 0 0.1rem 0";
                document.getElementById(
                    "username-field-input"
                ).style.borderImage =
                    "linear-gradient(to right, #ff00ff, #00ffff) 1";
            } else {
                document.getElementById("username-field-name").style.transform =
                    "translate(0, 0.3rem)";
                document.getElementById(
                    "username-field-input"
                ).style.borderImage = "none";
            }
            if (password !== "") {
                document.getElementById("password-field-name").style.transform =
                    "translate(0, -1rem)";
                document.getElementById(
                    "password-field-input"
                ).style.borderWidth = "0 0 0.1rem 0";
                document.getElementById(
                    "password-field-input"
                ).style.borderImage =
                    "linear-gradient(to right, #ff00ff, #00ffff) 1";
            } else {
                document.getElementById("password-field-name").style.transform =
                    "translate(0, 0.3rem)";
                document.getElementById(
                    "password-field-input"
                ).style.borderImage = "none";
            }
        };
        handleInputNameStyle();
    }, [username, password]);

    return (
        <div className="login-container">
            <h2 className="login-title">Welcome</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <label>
                    <input
                        id="username-field-input"
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                    <span id="username-field-name" className="input-name">
                        Username
                    </span>
                </label>
                <label>
                    <input
                        id="password-field-input"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                    <span id="password-field-name" className="input-name">
                        Password
                    </span>
                </label>
                <button type="submit">LOGIN</button>
            </form>
            <div className="redirect-signup">
                <span>
                    Already have an account? <a href="">Register now</a>
                </span>
            </div>
        </div>
    );
}
