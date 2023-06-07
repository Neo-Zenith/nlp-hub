import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/components/AccountDetails.css";
import UsersService from "../services/UsersService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ThreeCircles } from "react-loader-spinner";

export function AccountDetails() {
    const username = useSelector((state) => state.username);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    const accessToken = useSelector((state) => state.accessToken);
    const usersService = new UsersService({ dispatch: useDispatch() });
    const navigate = useNavigate();

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
                                <span className="details-value">
                                    {username}
                                </span>
                            </div>
                            <button>
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Name</span>
                                <span className="details-value">{name}</span>
                            </div>
                            <button>
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Email</span>
                                <span className="details-value">{email}</span>
                            </div>
                            <button>
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">
                                    Department
                                </span>
                                <span className="details-value">
                                    {department}
                                </span>
                            </div>
                            <button>
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </li>
                        <li>
                            <div className="details">
                                <span className="details-field">Password</span>
                                <span className="details-value">NeoZenith</span>
                            </div>
                            <button>
                                <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
}
