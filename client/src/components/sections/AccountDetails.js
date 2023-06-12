import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import "../../styles/components/sections/AccountDetails.css";
import { BounceLoader } from "react-spinners";
import { setLoaded } from "../../store/actions";
import UsersService from "../../services/UsersService";
import UIService from "../../services/UIServices";

export default function AccountDetails() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loader = {
        position: "absolute",
        display: "block",
        margin: "0 auto",
        marginTop: "20rem",
    };

    const dataLoaded = useSelector((state) => state.loaded);
    const username = useSelector((state) => state.username);
    const accessToken = useSelector((state) => state.accessToken);

    const usersService = useMemo(() => {
        return new UsersService({ dispatch });
    }, [dispatch]);

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const [updateActive, setUpdateActive] = useState(false);
    const [retrievedName, setRetrievedName] = useState("");
    const [retrievedEmail, setRetrievedEmail] = useState("");
    const [retrievedDep, setRetrievedDep] = useState("");

    function toggleBtns(e) {
        const field = e.currentTarget.id.split("-")[1];
        const cancelBtn = "cancel-" + field + "-btn";
        const updateBtn = "update-" + field + "-btn";
        const submitBtn = "submit-" + field + "-btn";
        const inputField = field + "-value";

        if (!updateActive) {
            document.getElementById(cancelBtn).style.display = "flex";
            document.getElementById(submitBtn).style.display = "flex";
            document.getElementById(updateBtn).style.display = "none";
            document.getElementById(inputField).style.display = "flex";
            setUpdateActive(true);
        } else {
            document.getElementById(cancelBtn).style.display = "none";
            document.getElementById(submitBtn).style.display = "none";
            document.getElementById(updateBtn).style.display = "flex";
            document.getElementById(inputField).style.display = "none";
            setUpdateActive(false);
        }
    }

    async function handleUpdate(e) {
        const field = e.currentTarget.id.split("-")[1];
        const cancelBtn = "cancel-" + field + "-btn";
        const updateBtn = "update-" + field + "-btn";
        const submitBtn = "submit-" + field + "-btn";
        const inputField = field + "-value";
        const inputValue = document.getElementById(inputField).value;

        if (inputValue === "") {
            document.getElementById(cancelBtn).style.display = "none";
            document.getElementById(submitBtn).style.display = "none";
            document.getElementById(updateBtn).style.display = "flex";
            document.getElementById(inputField).style.display = "none";
            setUpdateActive(false);
            return;
        }

        const updatePackage = {
            [field]: document.getElementById(inputField).value,
        };

        const response = await usersService.updateUser(
            updatePackage,
            username,
            accessToken
        );

        switch (response[0]) {
            case 200:
                document.getElementById(cancelBtn).style.display = "none";
                document.getElementById(submitBtn).style.display = "none";
                document.getElementById(updateBtn).style.display = "flex";
                document.getElementById(inputField).style.display = "none";
                setUpdateActive(false);
                break;
            default:
                uiService.setErrorMsg(response[1].message);
                return;
        }

        switch (field) {
            case "name":
                setRetrievedName(inputValue);
                break;
            case "email":
                setRetrievedEmail(inputValue);
                break;
            case "department":
                setRetrievedDep(inputValue);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            dispatch(setLoaded(false));
            const response = await usersService.retrieveUser(
                username,
                accessToken
            );

            switch (response[0]) {
                case 200:
                    setRetrievedDep(response[1].department);
                    setRetrievedEmail(response[1].email);
                    setRetrievedName(response[1].name);
                    dispatch(setLoaded(true));
                    break;

                default:
                    uiService.setErrorMsg("Error retrieving user details.");
                    dispatch(setLoaded(true));
                    navigate("/");
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="account-details-container">
                {!dataLoaded ? (
                    <BounceLoader
                        cssOverride={loader}
                        color="var(--color-secondary-red)"
                    />
                ) : (
                    <ul>
                        <li>
                            <div className="details-section">
                                <span className="details-field-title">
                                    Username
                                </span>
                                <div className="details-field-value-wrapper">
                                    <span className="details-field-value">
                                        {username}
                                    </span>
                                    <input
                                        id="username-value"
                                        type="text"
                                        placeholder={username}
                                    />
                                </div>
                            </div>
                            <div className="action-btn">
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="cancel-username-btn"
                                    className="action-cancel-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    id="submit-username-btn"
                                    className="action-submit-btn"
                                    onClick={(e) => handleUpdate(e)}
                                >
                                    <i className="fa-regular fa-paper-plane"></i>
                                </button>
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="update-username-btn"
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div className="details-section">
                                <span className="details-field-title">
                                    Name
                                </span>
                                <div className="details-field-value-wrapper">
                                    <span className="details-field-value">
                                        {retrievedName}
                                    </span>
                                    <input
                                        id="name-value"
                                        type="text"
                                        placeholder={retrievedName}
                                    />
                                </div>
                            </div>
                            <div className="action-btn">
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="cancel-name-btn"
                                    className="action-cancel-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    id="submit-name-btn"
                                    className="action-submit-btn"
                                    onClick={(e) => handleUpdate(e)}
                                >
                                    <i className="fa-regular fa-paper-plane"></i>
                                </button>
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="update-name-btn"
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div className="details-section">
                                <span className="details-field-title">
                                    Email
                                </span>
                                <div className="details-field-value-wrapper">
                                    <span className="details-field-value">
                                        {retrievedEmail}
                                    </span>
                                    <input
                                        id="email-value"
                                        type="text"
                                        placeholder={retrievedEmail}
                                    />
                                </div>
                            </div>
                            <div className="action-btn">
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="cancel-email-btn"
                                    className="action-cancel-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    id="submit-email-btn"
                                    className="action-submit-btn"
                                    onClick={(e) => handleUpdate(e)}
                                >
                                    <i className="fa-regular fa-paper-plane"></i>
                                </button>
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="update-email-btn"
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div className="details-section">
                                <span className="details-field-title">
                                    Department
                                </span>
                                <div className="details-field-value-wrapper">
                                    <span className="details-field-value">
                                        {retrievedDep}
                                    </span>
                                    <input
                                        id="department-value"
                                        type="text"
                                        placeholder={retrievedDep}
                                    />
                                </div>
                            </div>
                            <div className="action-btn">
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="cancel-department-btn"
                                    className="action-cancel-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    id="submit-department-btn"
                                    className="action-submit-btn"
                                    onClick={(e) => handleUpdate(e)}
                                >
                                    <i className="fa-regular fa-paper-plane"></i>
                                </button>
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="update-department-btn"
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div className="details-section">
                                <span className="details-field-title">
                                    Password
                                </span>
                                <div className="details-field-value-wrapper">
                                    <span
                                        id="password-ph"
                                        className="details-field-value"
                                    >
                                        {Array.from({ length: 8 }).map(
                                            (_, i) => (
                                                <i
                                                    key={i}
                                                    className="fa-solid fa-circle"
                                                ></i>
                                            )
                                        )}
                                    </span>
                                    <input
                                        id="password-value"
                                        type="password"
                                        placeholder="New password"
                                    />
                                </div>
                            </div>
                            <div className="action-btn">
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="cancel-password-btn"
                                    className="action-cancel-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    id="submit-password-btn"
                                    className="action-submit-btn"
                                    onClick={(e) => handleUpdate(e)}
                                >
                                    <i className="fa-regular fa-paper-plane"></i>
                                </button>
                                <button
                                    onClick={(e) => toggleBtns(e)}
                                    id="update-password-btn"
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                            </div>
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
}
