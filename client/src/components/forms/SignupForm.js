import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import UsersService from "../../services/UsersService";
import UIService from "../../services/UIServices";
import bg from "../../img/credential-form-bg.jpg";
import "../../styles/components/forms/SignupForm.css";

export default function SignupForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const accessToken = useSelector((state) => state.accessToken);

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);
    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    });

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [cfmPassword, setCfmPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [hasValidLength, setHasValidLength] = useState(false);
    const [hasUpper, setHasUpper] = useState(false);
    const [hasLower, setHasLower] = useState(false);
    const [hasDigit, setHasDigit] = useState(false);

    useEffect(() => {
        if (accessToken !== null) {
            navigate("/");
        }
    }, [accessToken]);
    
    useEffect(() => {
        if (password !== "" && cfmPassword !== "") {
            document
                .getElementById("password-checker")
                .classList.add("match-password-popup");
            document.getElementById("password-checker").style.opacity = "1";
            if (password !== cfmPassword) {
                document.getElementById("password-checker").style.color =
                    "var(--color-warning)";
                setPasswordMatch(false);
            } else {
                document.getElementById("password-checker").style.color =
                    "var(--color-success)";
                setPasswordMatch(true);
            }
        } else {
            setPasswordMatch(false);
            document.getElementById("password-checker").style.opacity = "0";
            document
                .getElementById("password-checker")
                .classList.remove("match-password-popup");
        }
    }, [password, cfmPassword]);

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
            case "name":
                if (name === "") {
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
            case "email":
                if (email === "") {
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
            case "department":
                if (department === "") {
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
                if (cfmPassword === "") {
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

    function validatePassword() {
        const lengthPattern = /^.{8,}$/;
        const uppercasePattern = /[A-Z]/;
        const lowercasePattern = /[a-z]/;
        const digitPattern = /\d/;

        setHasValidLength(lengthPattern.test(password));
        setHasUpper(uppercasePattern.test(password));
        setHasLower(lowercasePattern.test(password));
        setHasDigit(digitPattern.test(password));
    }

    function validateInputs() {
        if (username === "") {
            uiServices.setErrorMsg("Username is required.");
            document.getElementById("username-input").focus();
            return false;
        }
        if (name === "") {
            uiServices.setErrorMsg("Name is required.");
            document.getElementById("name-input").focus();
            return false;
        }
        if (email === "") {
            uiServices.setErrorMsg("Email is required.");
            document.getElementById("email-input").focus();
            return false;
        }
        if (department === "") {
            uiServices.setErrorMsg("Department is required.");
            document.getElementById("department-input").focus();
            return false;
        }

        if (!passwordMatch) {
            uiServices.setErrorMsg("Passwords do not match.");
            document.getElementById("cfmpassword-input").focus();
            return false;
        }
        if (!hasUpper || !hasLower || !hasDigit || !hasValidLength) {
            uiServices.setErrorMsg("Password do not meet minimum requirement.");
            return false;
        }

        return true;
    }

    async function handleSignup() {
        if (validateInputs()) {
            const response = await usersService.registerUser(
                username,
                name,
                email,
                password,
                department
            );
            console.log(response);
            switch (response[0]) {
                case 201:
                    navigate("/");
                    break;
                default:
                    uiServices.setErrorMsg(response[1].message);
                    if (response[1].message.includes("username")) {
                        document.getElementById("username-input").focus();
                    } else if (response[1].message.includes("email")) {
                        document.getElementById("email-input").focus();
                    }
            }
        }
    }

    useEffect(() => {
        if (password !== "") {
            document
                .getElementById("password-req")
                .classList.add("password-req-popup");
            validatePassword();
        } else {
            setHasValidLength(false);
            setHasUpper(false);
            setHasLower(false);
            setHasDigit(false);
        }
    }, [password]);

    useEffect(() => {
        if (hasValidLength) {
            document.getElementById("min-char").className = "fa-solid fa-check";
            document.getElementById("min-char").style.color =
                "var(--color-success)";
            document.getElementById("min-char-text").style.color =
                "var(--color-success)";
        } else {
            document.getElementById("min-char").className = "fa-solid fa-xmark";
            document.getElementById("min-char").style.color =
                "var(--color-warning)";
            document.getElementById("min-char-text").style.color =
                "var(--color-warning)";
        }
        if (hasUpper) {
            document.getElementById("1-upper").className = "fa-solid fa-check";
            document.getElementById("1-upper").style.color =
                "var(--color-success)";
            document.getElementById("1-upper-text").style.color =
                "var(--color-success)";
        } else {
            document.getElementById("1-upper").className = "fa-solid fa-xmark";
            document.getElementById("1-upper").style.color =
                "var(--color-warning)";
            document.getElementById("1-upper-text").style.color =
                "var(--color-warning)";
        }
        if (hasLower) {
            document.getElementById("1-lower").className = "fa-solid fa-check";
            document.getElementById("1-lower").style.color =
                "var(--color-success)";
            document.getElementById("1-lower-text").style.color =
                "var(--color-success)";
        } else {
            document.getElementById("1-lower").className = "fa-solid fa-xmark";
            document.getElementById("1-lower").style.color =
                "var(--color-warning)";
            document.getElementById("1-lower-text").style.color =
                "var(--color-warning)";
        }
        if (hasDigit) {
            document.getElementById("1-digit").className = "fa-solid fa-check";
            document.getElementById("1-digit").style.color =
                "var(--color-success)";
            document.getElementById("1-digit-text").style.color =
                "var(--color-success)";
        } else {
            document.getElementById("1-digit").className = "fa-solid fa-xmark";
            document.getElementById("1-digit").style.color =
                "var(--color-warning)";
            document.getElementById("1-digit-text").style.color =
                "var(--color-warning)";
        }
    }, [hasValidLength, hasDigit, hasUpper, hasLower]);

    return (
        <>
            <div className="signup-form-container">
                <div className="signup-form-bg">
                    <img src={bg} />
                </div>
                <div className="signup-form">
                    <span className="signup-form-title">Welcome</span>
                    <span className="signup-form-subtitle">
                        To login as Admin, click <a href="/">here</a>.
                    </span>
                    <div>
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
                                id="name-input"
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                onFocus={(e) => {
                                    handleInputActive(e);
                                }}
                                onBlur={(e) => {
                                    handleInputInactive(e);
                                }}
                            />
                            <span id="name-field">Name</span>
                        </label>
                    </div>
                    <label>
                        <input
                            id="email-input"
                            type="email"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            onFocus={(e) => {
                                handleInputActive(e);
                            }}
                            onBlur={(e) => {
                                handleInputInactive(e);
                            }}
                        />
                        <span id="email-field">Email</span>
                    </label>
                    <label>
                        <input
                            id="department-input"
                            type="text"
                            onChange={(e) => {
                                setDepartment(e.target.value);
                            }}
                            onFocus={(e) => {
                                handleInputActive(e);
                            }}
                            onBlur={(e) => {
                                handleInputInactive(e);
                            }}
                        />
                        <span id="department-field">Department</span>
                    </label>
                    <div>
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
                        <label>
                            <input
                                id="cfmpassword-input"
                                type={passwordVisible ? "text" : "password"}
                                onChange={(e) => {
                                    setCfmPassword(e.target.value);
                                }}
                                onFocus={(e) => {
                                    handleInputActive(e);
                                }}
                                onBlur={(e) => {
                                    handleInputInactive(e);
                                }}
                            />
                            <span id="cfmpassword-field">Confirm Password</span>
                        </label>
                    </div>
                    <button
                        onClick={togglePasswordVisibility}
                        id="password-visibility-toggle"
                    >
                        <i
                            id="password-visibility-toggle-icon"
                            className="fa-solid fa-eye"
                        ></i>
                    </button>
                    <div className="password-prompts">
                        <ul id="password-req">
                            <li>
                                <i
                                    id="min-char"
                                    className="fa-solid fa-xmark"
                                ></i>
                                &nbsp;
                                <span id="min-char-text">
                                    Minimum 8 characters.
                                </span>
                            </li>
                            <li>
                                <i
                                    id="1-upper"
                                    className="fa-solid fa-xmark"
                                ></i>
                                &nbsp;
                                <span id="1-upper-text">
                                    Has at least 1 uppercase letter.
                                </span>
                            </li>
                            <li>
                                <i
                                    id="1-lower"
                                    className="fa-solid fa-xmark"
                                ></i>
                                &nbsp;
                                <span id="1-lower-text">
                                    Has at least 1 lowercase letter.
                                </span>
                            </li>
                            <li>
                                <i
                                    id="1-digit"
                                    className="fa-solid fa-xmark"
                                ></i>
                                &nbsp;
                                <span id="1-digit-text">
                                    Has at least 1 digit.
                                </span>
                            </li>
                        </ul>
                        <span id="password-checker">
                            {passwordMatch
                                ? "Password match."
                                : "Password do not match"}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            handleSignup();
                        }}
                        className="signup-btn"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </>
    );
}
