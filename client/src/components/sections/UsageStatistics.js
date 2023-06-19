import React, { useState, useEffect } from "react";
import ChartComponent from "../utils/ChartComponent";

export default function UsageStatistics() {
    const [usages, setUsages] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedVersion, setSelectedVersion] = useState("");
    const [selectedDateRange, setSelectedDateRange] = useState("");

    useEffect(() => {
        retrieveUsages();
    }, []);

    const retrieveUsages = () => {
        // Call the API to retrieve usages and update the state
        // You can replace this with your actual API call
        const fakeUsages = [
            {
                type: "ServiceA",
                version: "1.0",
                dateTime: "2023-06-13T10:00:00Z",
            },
            {
                type: "ServiceB",
                version: "2.1",
                dateTime: "2023-06-13T11:00:00Z",
            },
            {
                type: "ServiceA",
                version: "1.0",
                dateTime: "2023-06-14T10:00:00Z",
            },
            {
                type: "ServiceB",
                version: "2.2",
                dateTime: "2023-06-15T16:00:00Z",
            },
            // Add more usage data as needed
        ];

        setUsages(fakeUsages);
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const handleVersionChange = (e) => {
        setSelectedVersion(e.target.value);
    };

    const handleDateRangeChange = (e) => {
        setSelectedDateRange(e.target.value);
    };

    return (
        <div>
            <h2>Usage Statistics</h2>
            <div>
                <label>Type:</label>
                <select value={selectedType} onChange={handleTypeChange}>
                    <option value="">All</option>
                    <option value="ServiceA">Service A</option>
                    <option value="ServiceB">Service B</option>
                    {/* Add more options as needed */}
                </select>
            </div>
            <div>
                <label>Version:</label>
                <select value={selectedVersion} onChange={handleVersionChange}>
                    <option value="">All</option>
                    <option value="1.0">1.0</option>
                    <option value="2.0">2.0</option>
                    {/* Add more options as needed */}
                </select>
            </div>
            <div>
                <label>Date Range:</label>
                <select
                    value={selectedDateRange}
                    onChange={handleDateRangeChange}
                >
                    <option value="">All</option>
                    <option value="2023-06-15,2023-06-17">
                        June 15 - June 17
                    </option>
                    <option value="2023-06-18,2023-06-20">
                        June 18 - June 20
                    </option>
                    {/* Add more options as needed */}
                </select>
            </div>
            <ChartComponent
                usages={usages}
                selectedType={selectedType}
                selectedVersion={selectedVersion}
                selectedDateRange={selectedDateRange}
            />
        </div>
    );
}
