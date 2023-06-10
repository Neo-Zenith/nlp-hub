import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import UsersService from "../../services/UsersService";
import UIService from "../../services/UIServices";
import bg from "../../img/credential-form-bg.jpg";
import "../../styles/components/forms/LoginForm.css";

export default function LoginForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    });

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);

    function handleInputActive(e) {
        const currentActive = e.target.id.split("-")[0];
        const targetField = currentActive + "-field";
        document
            .getElementById(targetField)
            .classList.remove("on-inactive-text");
        document.getElementById(targetField).classList.add("on-active-text");
        document.getElementById(e.target.id).style.borderColor =
            "var(--color-secondary-red)";
    }

    function handleInputInactive(e) {
        const currentActive = e.target.id.split("-")[0];
        const targetField = currentActive + "-field";
        switch (currentActive) {
            case "username":
                if (username === "") {
                    document
                        .getElementById(targetField)
                        .classList.remove("on-active-text");
                    document
                        .getElementById(targetField)
                        .classList.add("on-inactive-text");
                    document.getElementById(e.target.id).style.borderColor =
                        "var(--color-grey)";
                }
                break;
            case "password":
                if (password === "") {
                    document
                        .getElementById(targetField)
                        .classList.remove("on-active-text");
                    document
                        .getElementById(targetField)
                        .classList.add("on-inactive-text");
                    document.getElementById(e.target.id).style.borderColor =
                        "var(--color-grey)";
                }
                break;
            default:
                break;
        }
    }

    function togglePasswordVisibility() {
        if (passwordVisible) {
            setPasswordVisible(false);
            document.getElementById(
                "password-visibility-toggle-icon"
            ).className = "fa-solid fa-eye";
        } else {
            setPasswordVisible(true);
            document.getElementById(
                "password-visibility-toggle-icon"
            ).className = "fa-solid fa-eye-slash";
        }
    }

    function validateInputs() {
        if (username === "") {
            uiServices.setErrorMsg("Username is required.");
            document.getElementById("username-input").focus();
            return false;
        }
        if (password === "") {
            uiServices.setErrorMsg("Password is required.");
            document.getElementById("password-input").focus();
            return false;
        }

        return true;
    }

    async function handleLogin() {
        if (validateInputs()) {
            const response = await usersService.loginUser(username, password);
            switch (response[0]) {
                case 201:
                    navigate("/");
                    break;
                default:
                    uiServices.setErrorMsg(response[1].message);
                    document.getElementById("username-input").focus();
            }
        }
    }

    return (
        <>
            <div className="login-form-container">
                <div className="login-form-bg">
                    <img src={bg} />
                </div>
                <div className="login-form">
                    <span className="login-form-title">Welcome</span>
                    <span className="login-form-subtitle">
                        To login as Admin, click <a href="/">here</a>.
                    </span>
                    <label>
                        <input
                            id="username-input"
                            type="text"
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                            onFocus={(e) => {
                                handleInputActive(e);
                            }}
                            onBlur={(e) => {
                                handleInputInactive(e);
                            }}
                        />
                        <span id="username-field">Username</span>
                    </label>
                    <label>
                        <input
                            id="password-input"
                            type={passwordVisible ? "text" : "password"}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            onFocus={(e) => {
                                handleInputActive(e);
                            }}
                            onBlur={(e) => {
                                handleInputInactive(e);
                            }}
                        />
                        <span id="password-field">Password</span>
                    </label>

                    <button
                        onClick={togglePasswordVisibility}
                        id="password-visibility-toggle-signup"
                    >
                        <i
                            id="password-visibility-toggle-icon"
                            className="fa-solid fa-eye"
                        ></i>
                    </button>
                    <button
                        onClick={() => {
                            handleLogin();
                        }}
                        className="login-btn"
                    >
                        Login
                    </button>
                    <span className="redirect-link">
                        Don't have an account?{" "}
                        <a href="/signup">Register now</a>.
                    </span>
                </div>
            </div>
        </>
    );
}
