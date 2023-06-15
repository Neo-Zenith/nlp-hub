import React, { useEffect, useState } from "react";
import Selector from "../utils/Selector.js";
import "../../styles/components/sections/QueryGUI.css";

export default function QueryGUI({ options }) {
    const [fields, setFields] = useState({});

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
    };

    useEffect(() => {
        console.log(fields);
    }, [fields]);

    return (
        <div className="query-gui-wrapper">
            <div className="query-gui-container">
                {Object.entries(options).map(([field, type]) => {
                    if (type === "boolean") {
                        return (
                            <div className="boolean-input" key={field}>
                                <label>{field}</label>
                                <div className="boolean-selector">
                                    <Selector
                                        options={[
                                            {
                                                value: "true",
                                                label: "true",
                                            },
                                            {
                                                value: "false",
                                                label: "false",
                                            },
                                        ]}
                                        onSelect={(value) => {
                                            setFields((prevFields) => ({
                                                ...prevFields,
                                                [field]: value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="string-input" key={field}>
                                <label>{field}</label>
                                <input
                                    type="text"
                                    id={field}
                                    name={field}
                                    onChange={(e) => {
                                        setFields((prevFields) => ({
                                            ...prevFields,
                                            [field]: e.target.value,
                                        }));
                                    }}
                                />
                            </div>
                        );
                    }
                })}
            </div>
            <button className="query-btn" type="submit" onSubmit={handleSubmit}>
                Submit
            </button>
        </div>
    );
}
