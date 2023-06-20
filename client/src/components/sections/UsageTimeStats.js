import React, { useState, useEffect, useMemo } from "react";
import ChartComponent from "../utils/ChartComponent";
import "../../styles/components/sections/UsageTimeStats.css";
import Selector from "../utils/Selector";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../../services/UIServices";
import UsageService from "../../services/UsageService";
import { setLoaded } from "../../store/actions";

export default function UsageTimeStats({ onChangeChart }) {
    const dispatch = useDispatch();

    const accessToken = useSelector((state) => state.accessToken);

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);
    const usageService = useMemo(() => {
        return new UsageService({ dispatch });
    }, [dispatch]);

    const [usages, setUsages] = useState([]);
    const [selectedType, setSelectedType] = useState("All Types");
    const [selectedVersion, setSelectedVersion] = useState("All Versions");
    const [selectedDateRange, setSelectedDateRange] = useState("All Dates");
    const [filteredUsages, setFilteredUsages] = useState(null);

    useEffect(() => {
        async function retrieveUsages() {
            dispatch(setLoaded(false));
            const response = await usageService.retrieveUsages(accessToken);

            switch (response[0]) {
                case 200:
                    setUsages(response[1].usages);
                    break;

                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
            dispatch(setLoaded(true));
        }
        retrieveUsages();
    }, []);

    useEffect(() => {
        console.log(usages);
    }, [usages]);

    useEffect(() => {
        if (filteredUsages && filteredUsages.length === 0) {
            uiService.setErrorMsg("No usage records found.");
        }
    }, [filteredUsages]);

    const handleChangeChart = (e) => {
        onChangeChart(e.target.innerText);
    };

    return (
        <div className="usage-stats-container">
            <div className="usage-header">
                <div className="chart-title">
                    <span>Usage Trend</span> |
                    <button onClick={handleChangeChart}>
                        Usage Performance
                    </button>
                </div>
                <div className="usage-stats-filter">
                    <div>
                        <Selector
                            options={[
                                { value: "All Types", label: "All Types" },
                                { value: "SUD", label: "SUD" },
                            ]}
                            onSelect={(value) => setSelectedType(value)}
                            defaultSelect={"All Types"}
                        />
                    </div>
                    <div>
                        <Selector
                            options={[
                                {
                                    value: "All Versions",
                                    label: "All Versions",
                                },
                                { value: "v1", label: "v1" },
                                { value: "v2", label: "v2" },
                            ]}
                            onSelect={(value) => setSelectedVersion(value)}
                            defaultSelect={"All Versions"}
                        />
                    </div>
                    <div>
                        <Selector
                            options={[
                                { value: "All Dates", label: "All Dates" },
                                { value: "Past 1 Week", label: "Past 1 Week" },
                                {
                                    value: "Past 1 Month",
                                    label: "Past 1 Month",
                                },
                                {
                                    value: "Past 3 Months",
                                    label: "Past 3 Months",
                                },
                            ]}
                            onSelect={(value) => setSelectedDateRange(value)}
                            defaultSelect={"All Dates"}
                        />
                    </div>
                </div>
            </div>
            <div className="chart-wrapper">
                <ChartComponent
                    usages={usages}
                    selectedType={selectedType}
                    selectedVersion={selectedVersion}
                    selectedDateRange={selectedDateRange}
                    onFilter={(value) => setFilteredUsages(value)}
                />
            </div>
        </div>
    );
}
