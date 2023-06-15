import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/sections/QueryCLI.css";
import { useDispatch } from "react-redux";
import UIService from "../../services/UIServices";

export default function QueryCLI({ options }) {
    const dispatch = useDispatch();

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const [currentOptions, setCurrentOptions] = useState(options);
    const [jsonInput, setJsonInput] = useState("");
    const [rerenderTrigger, setRerenderTrigger] = useState(Date.now());

    useEffect(() => {
        setCurrentOptions(options);
        setRerenderTrigger(Date.now());
    }, [options]);

    // Function to handle form submission
    function handleSubmit() {
        // Handle form submission logic here
        const payload = parseJSON();
        if (!payload) {
            uiService.setErrorMsg("Invalid payload format. Please try again.");
        } else {
        }
    }

    function parseJSON() {
        try {
            return JSON.parse(jsonInput);
        } catch (error) {
            return null;
        }
    }

    return (
        <div className="query-cli-wrapper">
            <div key={rerenderTrigger} className="query-cli-container">
                <label htmlFor="jsonInput">Query Payload</label>
                <textarea
                    id="jsonInput"
                    name="jsonInput"
                    rows="5"
                    cols="50"
                    defaultValue={JSON.stringify(currentOptions, null, 2)}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
            </div>
            <button
                type="submit"
                className="query-btn-cli"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </div>
    );
}
