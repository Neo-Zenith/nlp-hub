import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/components/AccountDetails.css";
import UsersService from "../services/UsersService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";
import { setUsername } from "../store/actions";

export function AccountDetails() {
    const username = useSelector((state) => state.username);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    const [updateActive, setUpdateActive] = useState(false);

    const accessToken = useSelector((state) => state.accessToken);
    const usersService = new UsersService({ dispatch: useDispatch() });
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        const field = e.currentTarget.id.split("-")[1];
        const input = field + "-input";
        const original = field + "-value";
        const btn = "update-" + field + "-logo";
        const cancelBtn = "cancel-" + field + "-update-btn";
        if (!updateActive) {
            document.getElementById(input).style.display = "flex";
            document.getElementById(original).style.opacity = "0";
            document.getElementById(btn).className = "fa-solid fa-floppy-disk";
            document.getElementById(cancelBtn).style.display = "block";
            setUpdateActive(true);
        } else {
            const value = document.getElementById(input).value;
            if (await updateUser(field, value)) {
                document.getElementById(input).style.display = "none";
                document.getElementById(original).style.opacity = "1";
                document.getElementById(btn).className =
                    "fa-regular fa-pen-to-square";
                document.getElementById(cancelBtn).style.display = "none";
                setUpdateActive(false);
            }
        }
    };

    const cancelUpdate = (e) => {
        const field = e.currentTarget.id.split("-")[1];
        const input = field + "-input";
        const original = field + "-value";
        const btn = "update-" + field + "-logo";
        const cancelBtn = "cancel-" + field + "-update-btn";
        document.getElementById(input).style.display = "none";
        document.getElementById(original).style.opacity = "1";
        document.getElementById(btn).className = "fa-regular fa-pen-to-square";
        document.getElementById(cancelBtn).style.display = "none";
        setUpdateActive(false);
    };

    async function updateUser(field, updateData) {
        const updatePackage = {
            [field]: updateData,
        };
        const response = await usersService.updateUser(
            updatePackage,
            username,
            accessToken
        );

        if (response === true) {
            if (field === "email") {
                setEmail(updateData);
            } else if (field === "department") {
                setDepartment(updateData);
            } else if (field === "name") {
                setName(updateData);
            }
            return true;
        } else {
            toast.error(response.message);
            return false;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const response = await usersService.retrieveUser(
                username,
                accessToken
            );
            const statusCode = response[0];
            if (statusCode === 200) {
                const { name, email, department } = response[1];
                setName(name);
                setEmail(email);
                setDepartment(department);
                setDataLoaded(true);
            } else {
                toast.error("Invalid request. Username is not valid.", {
                    onClose: () => {
                        navigate("/");
                    },
                    autoClose: 500,
                    pauseOnHover: false,
                });
            }
        };
        fetchData();
    }, [navigate]);

    useEffect(() => {
        console.log(name);
    }, [username, name, email, department]);

    return (
        <>
            <div id="account-details" className="account-details-container">
                {!dataLoaded ? (
                    <div className="loading-wheel">
                        <ThreeCircles
                            width="50"
                            color=""
                            height="50"
                            wrapperStyle={{
                                marginTop: "10rem",
                            }}
                            wrapperClass=""
                            visible={true}
                            ariaLabel="three-circles-rotating"
                            outerCircleColor="var(--color-primary-blue)"
                            innerCircleColor="var(--color-primary-red)"
                            middleCircleColor="var(--color-primary-blue)"
                        />
                    </div>
                ) : (
                    <ul className="account-details-list">
                        <li>
                            <div className="details">
                                <span className="details-field">Username</span>
                                <span
                                    id="username-value"
                                    className="details-value"
                                >
                                    {username}
                                </span>
                                <input
                                    className="update-field"
                                    id="username-input"
                                    type="text"
                                    defaultValue={username}
                                ></input>
                            </div>
                            <button
                                className="cancel-update-btn"
                                id="cancel-username-update-btn"
                                onClick={cancelUpdate}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                className="update-btn"
                                id="update-username-btn"
                                onClick={handleUpdate}
                            >
                                <i
                                    id="update-username-logo"
                                    className="fa-regular fa-pen-to-square"
                                ></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Name</span>
                                <span id="name-value" className="details-value">
                                    {name}
                                </span>
                                <input
                                    className="update-field"
                                    id="name-input"
                                    type="text"
                                    defaultValue={name}
                                ></input>
                            </div>
                            <button
                                className="cancel-update-btn"
                                id="cancel-name-update-btn"
                                onClick={cancelUpdate}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                className="update-btn"
                                onClick={handleUpdate}
                                id="update-name-btn"
                            >
                                <i
                                    id="update-name-logo"
                                    className="fa-regular fa-pen-to-square"
                                ></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Email</span>
                                <span
                                    id="email-value"
                                    className="details-value"
                                >
                                    {email}
                                </span>
                                <input
                                    className="update-field"
                                    id="email-input"
                                    type="text"
                                    defaultValue={email}
                                ></input>
                            </div>
                            <button
                                className="cancel-update-btn"
                                id="cancel-email-update-btn"
                                onClick={cancelUpdate}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                className="update-btn"
                                onClick={handleUpdate}
                                id="update-email-btn"
                            >
                                <i
                                    id="update-email-logo"
                                    className="fa-regular fa-pen-to-square"
                                ></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">
                                    Department
                                </span>
                                <span
                                    id="department-value"
                                    className="details-value"
                                >
                                    {department}
                                </span>
                                <input
                                    className="update-field"
                                    id="department-input"
                                    type="text"
                                    defaultValue={department}
                                ></input>
                            </div>
                            <button
                                className="cancel-update-btn"
                                id="cancel-department-update-btn"
                                onClick={cancelUpdate}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                className="update-btn"
                                onClick={handleUpdate}
                                id="update-department-btn"
                            >
                                <i
                                    id="update-department-logo"
                                    className="fa-regular fa-pen-to-square"
                                ></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Password</span>
                                <span
                                    id="password-value"
                                    className="details-value"
                                >
                                    NeoZenith
                                </span>
                                <input
                                    className="update-field"
                                    id="password-input"
                                    type="text"
                                ></input>
                            </div>
                            <button
                                className="cancel-update-btn"
                                id="cancel-password-update-btn"
                                onClick={cancelUpdate}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <button
                                className="update-btn"
                                onClick={handleUpdate}
                                id="update-password-btn"
                            >
                                <i
                                    id="update-password-logo"
                                    className="fa-regular fa-pen-to-square"
                                ></i>
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
}
