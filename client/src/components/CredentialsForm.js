import React, { useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/CredentialsForm.css";
import UsersService from "../services/UsersService";
import { useDispatch } from "react-redux";
import { UIService } from "../services/UIServices";

export function LoginComponent() {
    const dispatch = useDispatch();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleOnFocus = (e) => {
        const targetID = e.target.id.split("-")[0] + "-field-name";
        document.getElementById(targetID).style.transform =
            "translate(0, -1rem)";
    };

    const handleExitFocus = (e) => {
        const variable = e.target.id.split("-")[0];
        const targetID = variable + "-field-name";
        if (eval(variable) === "") {
            document.getElementById(targetID).style.transform =
                "translate(0, 0.3rem)";
        }
    };

    const togglePasswordVisibility = (e) => {
        const icons = {
            visible: "fa-solid fa-eye",
            invisible: "fa-solid fa-eye-slash",
        };

        if (
            document.getElementById("toggle-icon").className === icons.visible
        ) {
            document.getElementById("toggle-icon").className = icons.invisible;
            document.getElementById("password-field-input").type = "text";
        } else {
            document.getElementById("toggle-icon").className = icons.visible;
            document.getElementById("password-field-input").type = "password";
        }
    };

    function validateInputs() {
        if (username === "" || password === "") {
            const error = "Username and password cannot be empty.";
            uiServices.setErrorMsg(error);
            return false;
        }
        return true;
    }

    async function handleLogin(e) {
        e.preventDefault();
        if (!validateInputs()) {
            return false;
        }
        const response = await usersService.loginUser(username, password);
        if (!response) {
            const error = "Invalid username and/or password.";
            uiServices.setErrorMsg(error);
        }
    }

    useEffect(() => {
        const handleInputNameStyle = () => {
            const inputs = ["username", "password"];

            for (const input of inputs) {
                if (eval(input) !== "") {
                    document.getElementById(`${input}-field-name`).style.color =
                        "var(--color-secondary-red)";
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, -1rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderStyle = "solid";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderWidth = "0 0 0.1rem 0";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderColor = "var(--color-secondary-red)";
                } else {
                    document.getElementById(`${input}-field-name`).style.color =
                        "var(--color-grey)";
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, 0.3rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderColor = "var(--color-light-grey)";
                }
            }
        };
        handleInputNameStyle();
    }, [username, password]);

    return (
        <div className="login-container">
            <h2 className="login-title">Welcome</h2>
            <div className="login-prompt">
                <span>
                    To login as Admin, click&nbsp;
                    <a href="">here</a>.
                </span>
            </div>
            <div className="login-form">
                <label>
                    <input
                        id="username-field-input"
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        onFocus={handleOnFocus}
                        onBlur={handleExitFocus}
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
                        onFocus={handleOnFocus}
                        onBlur={handleExitFocus}
                        required
                    />
                    <span id="password-field-name" className="input-name">
                        Password
                    </span>
                    <button
                        onClick={togglePasswordVisibility}
                        id="password-visibility-toggle"
                    >
                        <i id="toggle-icon" className="fa-solid fa-eye"></i>
                    </button>
                </label>
                <button onClick={handleLogin} type="submit">
                    LOGIN
                </button>
            </div>
            <div className="redirect-signup">
                <span>
                    Don't have an account? <a href="/signup">Register now</a>
                </span>
            </div>
        </div>
    );
}

export function SignupComponent() {
    const dispatch = useDispatch();

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [retypedPassword, setRetypedPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState({});

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleDepartmentChange = (e) => {
        setDepartment(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleRetypedPasswordChange = (e) => {
        setRetypedPassword(e.target.value);
    };

    const handleOnFocus = (e) => {
        const targetID = e.target.id.split("-")[0] + "-field-name";
        document.getElementById(targetID).style.transform =
            "translate(0, -1rem)";
    };

    const handleExitFocus = (e) => {
        const variable = e.target.id.split("-")[0];
        const targetID = variable + "-field-name";
        if (eval(variable) === "") {
            document.getElementById(targetID).style.transform =
                "translate(0, 0.3rem)";
        }
    };

    const togglePasswordVisibility = (e) => {
        const icons = {
            visible: "fa-solid fa-eye",
            invisible: "fa-solid fa-eye-slash",
        };

        if (
            document.getElementById("toggle-icon").className === icons.visible
        ) {
            document.getElementById("toggle-icon").className = icons.invisible;
            document.getElementById("password-field-input").type = "text";
            document.getElementById("retypedPassword-field-input").type =
                "text";
        } else {
            document.getElementById("toggle-icon").className = icons.visible;
            document.getElementById("password-field-input").type = "password";
            document.getElementById("retypedPassword-field-input").type =
                "password";
        }
    };

    function validateInputs() {
        if (username === "") {
            const error = "A username is required.";
            uiServices.setErrorMsg(error);
            return false;
        }
        if (name === "") {
            const error = "A name is required.";
            uiServices.setErrorMsg(error);
            return false;
        }
        if (email === "") {
            const error = "An email address is required.";
            uiServices.setErrorMsg(error);
            return false;
        }
        if (department === "") {
            const error = "A department is required.";
            uiServices.setErrorMsg(error);
            return false;
        }
        if (password === "") {
            const error = "A password is required.";
            uiServices.setErrorMsg(error);
            return false;
        }
        if (password !== retypedPassword) {
            const error = "Passwords do not match.";
            uiServices.setErrorMsg(error);
            return false;
        }
        return true;
    }

    async function handleSignup(e) {
        e.preventDefault();
        if (!validateInputs()) {
            return false;
        }
        const response = await usersService.registerUser(
            username,
            name,
            email,
            password,
            department
        );

        if (response !== true) {
            if (response.statusCode === 400) {
                if (response.message.includes("username")) {
                    const error =
                        "Username must be at least 5 alphanumeric characters.";
                    uiServices.setErrorMsg(error);
                } else if (response.message.includes("password")) {
                    const error = "Password must be minimum 8 characters.";
                    uiServices.setErrorMsg(error);
                }
            } else if (response.statusCode === 409) {
                uiServices.setErrorMsg(response.message);
            }
        }
    }

    useEffect(() => {
        const handleInputNameStyle = () => {
            const inputs = [
                "username",
                "name",
                "email",
                "password",
                "retypedPassword",
                "department",
            ];

            for (const input of inputs) {
                if (eval(input) !== "") {
                    document.getElementById(`${input}-field-name`).style.color =
                        "var(--color-secondary-red)";
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, -1rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderStyle = "solid";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderWidth = "0 0 0.1rem 0";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderColor = "var(--color-secondary-red)";
                } else {
                    document.getElementById(`${input}-field-name`).style.color =
                        "var(--color-grey)";
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, 0.3rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderColor = "var(--color-light-grey)";
                }
            }
        };
        handleInputNameStyle();
    }, [username, password, retypedPassword, name, email, department]);

    useEffect(() => {
        if (password && retypedPassword && password !== retypedPassword) {
            setPasswordMatch({
                message: "Passwords do not match",
                color: "var(--color-warning)",
            });
        } else if (
            password &&
            retypedPassword &&
            password === retypedPassword
        ) {
            setPasswordMatch({
                message: "Passwords match",
                color: "var(--color-success)",
            });
        } else {
            setPasswordMatch({
                message: "",
            });
        }
    }, [username, password, retypedPassword, name, email, department]);

    useEffect(() => {
        document.getElementById("password-checker").style.color =
            passwordMatch.color;
    }, [passwordMatch]);

    return (
        <div className="signup-container">
            <h2 className="signup-title">Welcome</h2>
            <div className="signup-form">
                <div className="name-inputs">
                    <label>
                        <input
                            id="username-field-input"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            onFocus={handleOnFocus}
                            onBlur={handleExitFocus}
                            required
                        />
                        <span id="username-field-name" className="input-name">
                            Username
                        </span>
                    </label>
                    <label>
                        <input
                            id="name-field-input"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onFocus={handleOnFocus}
                            onBlur={handleExitFocus}
                            required
                        />
                        <span id="name-field-name" className="input-name">
                            Name
                        </span>
                    </label>
                </div>

                <label>
                    <input
                        id="email-field-input"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={handleOnFocus}
                        onBlur={handleExitFocus}
                        required
                    />
                    <span id="email-field-name" className="input-name">
                        Email
                    </span>
                </label>
                <label>
                    <input
                        id="department-field-input"
                        type="text"
                        value={department}
                        onChange={handleDepartmentChange}
                        onFocus={handleOnFocus}
                        onBlur={handleExitFocus}
                        required
                    />
                    <span id="department-field-name" className="input-name">
                        Department
                    </span>
                </label>
                <div className="password-inputs">
                    <label>
                        <input
                            id="password-field-input"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            onFocus={handleOnFocus}
                            onBlur={handleExitFocus}
                            required
                        />
                        <span id="password-field-name" className="input-name">
                            Password
                        </span>
                    </label>
                    <label>
                        <input
                            id="retypedPassword-field-input"
                            type="password"
                            value={retypedPassword}
                            onChange={handleRetypedPasswordChange}
                            onFocus={handleOnFocus}
                            onBlur={handleExitFocus}
                            required
                        />
                        <span
                            id="retypedPassword-field-name"
                            className="input-name"
                        >
                            Confirm Password
                        </span>
                        <button
                            onClick={togglePasswordVisibility}
                            id="password-visibility-toggle"
                        >
                            <i id="toggle-icon" className="fa-solid fa-eye"></i>
                        </button>
                    </label>
                </div>

                <div id="password-checker">{passwordMatch.message}</div>
                <button onClick={handleSignup} type="submit">
                    SIGNUP
                </button>
            </div>
            <div className="redirect-login">
                <span>
                    Already have an account? <a href="/login">Login now</a>
                </span>
            </div>
        </div>
    );
}
