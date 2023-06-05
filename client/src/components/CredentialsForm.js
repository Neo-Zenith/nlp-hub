import React, { useEffect, useState } from "react";
import "../styles/components/CredentialsForm.css";
import { UsersService } from "../services/UsersService";

export function LoginComponent() {
    const usersService = new UsersService();
    const [errorMsg, setErrorMsg] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    async function handleLogin(e) {
        e.preventDefault();
        setErrorMsg("");
        const response = await usersService.loginUser(username, password);
        if (response) {
            setAccessToken(response);
        } else {
            setErrorMsg("Invalid username and/or password.");
        }
    }

    useEffect(() => {
        const handleInputNameStyle = () => {
            const inputs = ["username", "password"];

            for (const input of inputs) {
                if (eval(input) !== "") {
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
                    ).style.borderImage =
                        "linear-gradient(to right, #ff00ff, #00ffff) 1";
                } else {
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, 0.3rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderImage = "none";
                }
            }
        };
        handleInputNameStyle();
    }, [username, password]);

    useEffect(() => {
        /**
         * * log access token and username into redux store
         */
        setUsername("");
        setPassword("");
    }, [accessToken]);

    useEffect(() => {
        const displayErrorMessage = () => {
            if (errorMsg) {
                document.getElementById("error-message").style.opacity = "1";
            } else {
                document.getElementById("error-message").style.opacity = "0";
            }
        };
        displayErrorMessage();
    }, [errorMsg]);

    return (
        <div className="login-container">
            <h2 className="login-title">Welcome</h2>
            <div className="error-container">
                <span id="error-message">{errorMsg}</span>
            </div>
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
                    Don't have an account? <a href="">Register now</a>
                </span>
            </div>
        </div>
    );
}

export function SignupComponent() {
    const usersService = new UsersService();
    const [errorMsg, setErrorMsg] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [retypedPassword, setRetypedPassword] = useState("");

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

    async function handleSignup(e) {
        e.preventDefault();
        const response = await usersService.registerUser(
            username,
            name,
            email,
            password,
            department
        );

        if (response) {
            setErrorMsg("");
        } else {
            setErrorMsg(response.message);
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
                    ).style.borderImage =
                        "linear-gradient(to right, #ff00ff, #00ffff) 1";
                } else {
                    document.getElementById(
                        `${input}-field-name`
                    ).style.transform = "translate(0, 0.3rem)";
                    document.getElementById(
                        `${input}-field-input`
                    ).style.borderImage = "none";
                }
            }
        };
        handleInputNameStyle();
    }, [username, password, retypedPassword, name, email, department]);

    useEffect(() => {
        if (password && retypedPassword && password !== retypedPassword) {
            setErrorMsg("Passwords do not match!");
        } else {
            setErrorMsg("");
        }
    }, [retypedPassword, password]);

    useEffect(() => {
        const displayErrorMessage = () => {
            if (errorMsg) {
                document.getElementById("error-message").style.opacity = "1";
            } else {
                document.getElementById("error-message").style.opacity = "0";
            }
        };
        displayErrorMessage();
    }, [errorMsg]);

    return (
        <div className="signup-container">
            <h2 className="signup-title">Welcome</h2>
            <div className="error-container">
                <span id="error-message">{errorMsg}</span>
            </div>
            <form className="signup-form" onSubmit={handleSignup}>
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
                        id="name-field-input"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                    <span id="name-field-name" className="input-name">
                        Name
                    </span>
                </label>
                <label>
                    <input
                        id="email-field-input"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
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
                        required
                    />
                    <span id="department-field-name" className="input-name">
                        Department
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
                <label>
                    <input
                        id="retypedPassword-field-input"
                        type="password"
                        value={retypedPassword}
                        onChange={handleRetypedPasswordChange}
                        required
                    />
                    <span
                        id="retypedPassword-field-name"
                        className="input-name"
                    >
                        Retype Password
                    </span>
                </label>
                <button type="submit">SIGNUP</button>
            </form>
            <div className="redirect-login">
                <span>
                    Already have an account? <a href="">Login now</a>
                </span>
            </div>
        </div>
    );
}
