import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/CredentialsForm.css";
import UsersService from "../services/UsersService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function LoginComponent() {
    const usersService = new UsersService({ dispatch: useDispatch() });
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const accessToken = useSelector((state) => state.accessToken);

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
            showToastError("Username and password cannot be empty.");
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
            showToastError("Invalid username and/or password.");
        }
    }

    const showToastError = (message) => {
        const existingToast = toast.isActive(message);

        if (existingToast) {
            toast.update(existingToast, {
                type: toast.TYPE.ERROR,
                autoClose: 3000,
            });
        } else {
            toast.error(message, { toastId: message });
        }
    };

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken]);

    useEffect(() => {
        const handleInputNameStyle = () => {
            const inputs = ["username", "password"];

            for (const input of inputs) {
                if (eval(input) !== "") {
                    document.getElementById(`${input}-field-name`).style.color =
                        "var(--color-text-highlight)";
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
                    ).style.borderColor = "var(--color-text-highlight)";
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

    useEffect(() => {
        setUsername("");
        setPassword("");
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken, navigate]);

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
    const usersService = new UsersService();
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [retypedPassword, setRetypedPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState({});
    const accessToken = useSelector((state) => state.accessToken);
    const navigate = useNavigate();

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

    const showToastError = (message) => {
        const existingToast = toast.isActive(message);

        if (existingToast) {
            toast.update(existingToast, {
                type: toast.TYPE.ERROR,
                autoClose: 3000,
            });
        } else {
            toast.error(message, { toastId: message });
        }
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
            showToastError("A username is required.");
            return false;
        }
        if (name === "") {
            showToastError("A name is required.");
            return false;
        }
        if (email === "") {
            showToastError("An email address is required.");
            return false;
        }
        if (department === "") {
            showToastError("A department is required.");
            return false;
        }
        if (password === "") {
            showToastError("A password is required.");
            return false;
        }
        if (password !== retypedPassword) {
            showToastError("Passwords do not match");
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
                    showToastError(
                        "Username must be at least 5 alphanumeric characters."
                    );
                } else if (response.message.includes("password")) {
                    showToastError("Password must be minimum 8 characters.");
                }
            } else if (response.statusCode === 409) {
                showToastError(response.message);
            }
        }
    }

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken, navigate]);

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
                        "var(--color-text-highlight)";
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
                    ).style.borderColor = "var(--color-text-highlight)";
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
