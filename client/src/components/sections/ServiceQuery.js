import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/sections/ServiceQuery.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UIService from "../../services/UIServices";
import ServicesService from "../../services/ServicesService";
import { setLoaded } from "../../store/actions";
import QueryGUI from "./QueryGUI";
import QueryCLI from "./QueryCLI";

export default function ServiceQuery() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const servicesService = useMemo(() => {
        return new ServicesService({ dispatch });
    }, [dispatch]);
    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);

    const QUERY_TYPE = {
        GUI: "GUI",
        CLI: "CLI",
    };

    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [selectedQueryType, setSelectedQueryType] = useState(QUERY_TYPE.GUI);
    const [types, setTypes] = useState([]);
    const [versions, setVersions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [endpoints, setEndpoints] = useState([]);

    useEffect(() => {
        const fetchServiceTypes = async () => {
            dispatch(setLoaded(false));
            const response = await servicesService.retrieveServicesTypes(
                accessToken
            );

            switch (response[0]) {
                case 200:
                    setTypes(response[1].types);
                    break;
                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
            dispatch(setLoaded(true));
        };
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        const fetchServiceVersions = async () => {
            dispatch(setLoaded(false));
            const response = await servicesService.retrieveServicesVersions(
                accessToken,
                selectedType
            );

            switch (response[0]) {
                case 200:
                    setVersions(response[1].versions);
                    break;
                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
            dispatch(setLoaded(true));
        };

        if (selectedType !== null) {
            fetchServiceVersions();
        }
    }, [selectedType]);

    useEffect(() => {
        const fetchTasks = async () => {
            dispatch(setLoaded(false));
            const response = await servicesService.retrieveServicesEndpoints(
                accessToken,
                selectedType,
                selectedVersion
            );

            switch (response[0]) {
                case 200:
                    const tasks = response[1].endpoints.map(
                        (endpoint) => endpoint.task
                    );
                    setTasks(tasks);
                    setEndpoints(response[1].endpoints);
                    break;
                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
            dispatch(setLoaded(true));
        };

        if (selectedType !== null && selectedVersion !== null) {
            fetchTasks();
        }
    }, [selectedType, selectedVersion]);

    useEffect(() => {
        if (selectedTask !== null) {
            const endpoint = endpoints.filter(
                (endpoint) => endpoint.task === selectedTask
            )[0];
            setSelectedEndpoint(endpoint);
        }
    }, [selectedTask]);

    useEffect(() => {
        if (selectedTask && selectedEndpoint) {
            if (selectedQueryType === QUERY_TYPE.CLI) {
                document
                    .getElementById("query-cli-btn")
                    .classList.add("active");
                document.getElementById("query-gui").style.display = "none";
                document.getElementById("query-cli").style.display = "flex";
            } else {
                document
                    .getElementById("query-gui-btn")
                    .classList.add("active");
                document.getElementById("query-gui").style.display = "flex";
                document.getElementById("query-cli").style.display = "none";
            }
        }
    }, [selectedTask, selectedEndpoint, selectedQueryType]);

    function toggleType() {
        if (!isTypeOpen) {
            document.getElementById(
                "type-selection-btn"
            ).style.borderBottomLeftRadius = "0rem";
            document.getElementById(
                "type-selection-btn"
            ).style.borderBottomRightRadius = "0rem";
            document
                .getElementById("available-service-types")
                .classList.remove("inactive");
            document
                .getElementById("available-service-types")
                .classList.add("active");
            setIsTypeOpen(true);
        } else {
            document.getElementById(
                "type-selection-btn"
            ).style.borderBottomLeftRadius = "1.5rem";
            document.getElementById(
                "type-selection-btn"
            ).style.borderBottomRightRadius = "1.5rem";
            document
                .getElementById("available-service-types")
                .classList.remove("active");
            document
                .getElementById("available-service-types")
                .classList.add("inactive");
            setIsTypeOpen(false);
        }
    }

    function toggleVersion() {
        if (!isVersionOpen) {
            document.getElementById(
                "version-selection-btn"
            ).style.borderBottomLeftRadius = "0rem";
            document.getElementById(
                "version-selection-btn"
            ).style.borderBottomRightRadius = "0rem";
            document
                .getElementById("available-service-version")
                .classList.remove("inactive");
            document
                .getElementById("available-service-version")
                .classList.add("active");
            setIsVersionOpen(true);
        } else {
            document.getElementById(
                "version-selection-btn"
            ).style.borderBottomLeftRadius = "1.5rem";
            document.getElementById(
                "version-selection-btn"
            ).style.borderBottomRightRadius = "1.5rem";
            document
                .getElementById("available-service-version")
                .classList.remove("active");
            document
                .getElementById("available-service-version")
                .classList.add("inactive");
            setIsVersionOpen(false);
        }
    }

    function toggleTask() {
        if (!isTaskOpen) {
            document.getElementById(
                "task-selection-btn"
            ).style.borderBottomLeftRadius = "0rem";
            document.getElementById(
                "task-selection-btn"
            ).style.borderBottomRightRadius = "0rem";
            document
                .getElementById("available-service-task")
                .classList.remove("inactive");
            document
                .getElementById("available-service-task")
                .classList.add("active");
            setIsTaskOpen(true);
        } else {
            document.getElementById(
                "task-selection-btn"
            ).style.borderBottomLeftRadius = "1.5rem";
            document.getElementById(
                "task-selection-btn"
            ).style.borderBottomRightRadius = "1.5rem";
            document
                .getElementById("available-service-task")
                .classList.remove("active");
            document
                .getElementById("available-service-task")
                .classList.add("inactive");
            setIsTaskOpen(false);
        }
    }

    const handleTypeSelection = (type) => {
        setSelectedType(type);
        setSelectedVersion(null);
        setSelectedTask(null);
        setSelectedEndpoint(null);
        toggleType();
    };

    const handleVersionSelection = (version) => {
        setSelectedVersion(version);
        setSelectedTask(null);
        setSelectedEndpoint(null);
        toggleVersion();
    };

    const handleTaskSelection = (task) => {
        setSelectedTask(task);
        toggleTask();
    };

    const handleQueryTypeSelection = (queryType) => {
        setSelectedQueryType(queryType);
    };

    return (
        <div className="service-selection-container">
            <div className="selections">
                <div className="type-selection">
                    <button
                        id="type-selection-btn"
                        onClick={() => {
                            toggleType();
                            if (isVersionOpen) toggleVersion();
                            if (isTaskOpen) toggleTask();
                        }}
                    >
                        <span>
                            Type{" "}
                            <div>
                                <span
                                    className={`caret-light ${
                                        isTypeOpen ? "up" : "down"
                                    }`}
                                />
                            </div>
                        </span>
                    </button>
                    <div
                        id="available-service-types"
                        className="available-service-types"
                    >
                        {types.length !== 0 ? (
                            types.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeSelection(type)}
                                >
                                    {type}
                                </button>
                            ))
                        ) : (
                            <span className="no-valid-selection">
                                No valid types available.
                            </span>
                        )}
                    </div>
                </div>

                {selectedType && (
                    <div className="version-selection">
                        <button
                            id="version-selection-btn"
                            onClick={() => {
                                toggleVersion();
                                if (isTypeOpen) toggleType();
                                if (isTaskOpen) toggleTask();
                            }}
                        >
                            <span>
                                Version{" "}
                                <div>
                                    <span
                                        className={`caret-light ${
                                            isVersionOpen ? "up" : "down"
                                        }`}
                                    />
                                </div>
                            </span>
                        </button>
                        <div
                            id="available-service-version"
                            className="available-service-version"
                        >
                            {versions.length !== 0 ? (
                                versions.map((version) => (
                                    <button
                                        key={version}
                                        onClick={() =>
                                            handleVersionSelection(version)
                                        }
                                    >
                                        {version}
                                    </button>
                                ))
                            ) : (
                                <span className="no-valid-selection">
                                    No valid versions available.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {selectedVersion && versions.length !== 0 && (
                    <div className="task-selection">
                        <button
                            id="task-selection-btn"
                            onClick={() => {
                                toggleTask();
                                if (isVersionOpen) toggleVersion();
                                if (isTypeOpen) toggleType();
                            }}
                        >
                            <span>
                                Task{" "}
                                <div>
                                    <span
                                        className={`caret-light ${
                                            isTaskOpen ? "up" : "down"
                                        }`}
                                    />
                                </div>
                            </span>
                        </button>
                        <div
                            id="available-service-task"
                            className="available-service-task"
                        >
                            {tasks.length !== 0 ? (
                                tasks.map((task) => (
                                    <button
                                        key={task}
                                        onClick={() =>
                                            handleTaskSelection(task)
                                        }
                                    >
                                        {task}
                                    </button>
                                ))
                            ) : (
                                <span className="no-valid-selection">
                                    No valid tasks available.
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {selectedTask && selectedEndpoint && (
                <div className="query-container">
                    <div className="query-type-options">
                        <button
                            id="query-gui-btn"
                            onClick={(e) => {
                                document
                                    .getElementById(e.currentTarget.id)
                                    .classList.add("active");
                                document
                                    .getElementById("query-cli-btn")
                                    .classList.remove("active");
                                handleQueryTypeSelection(QUERY_TYPE.GUI);
                            }}
                        >
                            GUI
                        </button>
                        <button
                            id="query-cli-btn"
                            onClick={(e) => {
                                document
                                    .getElementById(e.currentTarget.id)
                                    .classList.add("active");
                                document
                                    .getElementById("query-gui-btn")
                                    .classList.remove("active");
                                handleQueryTypeSelection(QUERY_TYPE.CLI);
                            }}
                        >
                            Manual
                        </button>
                    </div>
                    <div className="query-wrapper">
                        <div id="query-gui" className="query-gui">
                            <QueryGUI options={selectedEndpoint.options} />
                        </div>
                        <div id="query-cli" className="query-cli">
                            <QueryCLI options={selectedEndpoint.options} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
