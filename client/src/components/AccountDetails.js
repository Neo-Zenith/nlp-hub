import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/components/AccountDetails.css";
import UsersService from "../services/UsersService";

export function AccountDetails() {
    const username = useSelector((state) => state.username);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const accessToken = useSelector((state) => state.accessToken);
    const usersService = new UsersService({ dispatch: useDispatch() });

    useEffect(() => {
        const fetchData = async () => {
            const response = await usersService.retrieveUser(
                username,
                accessToken
            );
            console.log(response);
            const statusCode = response[0];
            const { name, email, department } = response[1];
            setName(name);
            setEmail(email);
            setDepartment(department);
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="account-details-container">
                <ul className="account-details-list">
                    <li>
                        <div className="details">
                            <span className="details-field">Username</span>
                            <span className="details-value">{username}</span>
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
                            <span className="details-field">Department</span>
                            <span className="details-value">{department}</span>
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
            </div>
        </>
    );
}
