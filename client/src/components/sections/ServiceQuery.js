import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/sections/ServiceQuery.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import UIService from "../../services/UIServices";
import ServicesService from "../../services/ServicesService";
import { setLoaded } from "../../store/actions";
import QueryGUI from "./QueryGUI";
import QueryCLI from "./QueryCLI";
import { BounceLoader } from "react-spinners";
import QueryUpload from "./QueryUpload";

export default function ServiceQuery() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const loader = {
        position: "absolute",
        display: "flex",
        marginLeft: "45%",
        marginTop: "1rem",
    };

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
    const [typeLoaded, setTypeLoaded] = useState(false);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [versionLoaded, setVersionLoaded] = useState(false);
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [taskLoaded, setTaskLoaded] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [selectedQueryType, setSelectedQueryType] = useState(QUERY_TYPE.GUI);
    const [types, setTypes] = useState([]);
    const [versions, setVersions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [endpoints, setEndpoints] = useState([]);
    const [nonTextBasedQueryOption, setNonTextBasedQueryOption] = useState(0);

    useEffect(() => {
        const fetchServiceTypes = async () => {
            dispatch(setLoaded(false));
            setTypeLoaded(false);
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
            setTypeLoaded(true);
        };
        fetchServiceTypes();
        toggleType();
    }, []);

    useEffect(() => {
        if (types.length !== 0) {
            if (params.type && types.includes(params.type)) {
                setSelectedType(params.type);
            } else {
                window.history.replaceState(null, null, "/query");
            }
        }
    }, [types]);

    useEffect(() => {
        const fetchServiceVersions = async () => {
            dispatch(setLoaded(false));
            setVersionLoaded(false);
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
            setVersionLoaded(true);
        };

        if (selectedType !== null) {
            window.history.replaceState(null, null, "/query/" + selectedType);
            fetchServiceVersions();
        }
    }, [selectedType]);

    useEffect(() => {
        if (versions.length !== 0) {
            if (params.version && versions.includes(params.version)) {
                setSelectedVersion(params.version);
            } else {
                window.history.replaceState(
                    null,
                    null,
                    "/query/" + selectedType
                );
            }
            if (!isVersionOpen) toggleVersion();
        }
    }, [versions]);

    useEffect(() => {
        const fetchTasks = async () => {
            dispatch(setLoaded(false));
            setTaskLoaded(false);
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
            setTaskLoaded(true);
        };

        if (selectedType !== null && selectedVersion !== null) {
            window.history.replaceState(
                null,
                null,
                "/query/" + selectedType + "/" + selectedVersion
            );
            fetchTasks();
        }
    }, [selectedType, selectedVersion]);

    useEffect(() => {
        if (tasks.length !== 0) {
            if (params.task && tasks.includes(params.task)) {
                setSelectedTask(params.task);
            } else {
                window.history.replaceState(
                    null,
                    null,
                    "/query/" + selectedType + "/" + selectedVersion
                );
            }
            if (!isTaskOpen) toggleTask();
        }
    }, [tasks]);

    useEffect(() => {
        if (selectedTask !== null) {
            window.history.replaceState(
                null,
                null,
                "/query/" +
                    selectedType +
                    "/" +
                    selectedVersion +
                    "/" +
                    selectedTask
            );
            const endpoint = endpoints.filter(
                (endpoint) => endpoint.task === selectedTask
            )[0];
            setSelectedEndpoint(endpoint);
        }
    }, [selectedTask]);

    useEffect(() => {
        if (selectedTask && selectedEndpoint && selectedEndpoint.textBased) {
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
            document
                .getElementById("type-selection-btn")
                .classList.add("active");
            document
                .getElementById("available-service-types")
                .classList.remove("inactive");
            document
                .getElementById("available-service-types")
                .classList.add("active");
            setIsTypeOpen(true);
        } else {
            document
                .getElementById("type-selection-btn")
                .classList.remove("active");
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
            document
                .getElementById("version-selection-btn")
                .classList.add("active");
            document
                .getElementById("available-service-version")
                .classList.remove("inactive");
            document
                .getElementById("available-service-version")
                .classList.add("active");
            setIsVersionOpen(true);
        } else {
            document
                .getElementById("version-selection-btn")
                .classList.remove("active");
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
            document
                .getElementById("task-selection-btn")
                .classList.add("active");
            document
                .getElementById("available-service-task")
                .classList.remove("inactive");
            document
                .getElementById("available-service-task")
                .classList.add("active");
            setIsTaskOpen(true);
        } else {
            document
                .getElementById("task-selection-btn")
                .classList.remove("active");
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
        if (isTaskOpen) toggleTask();
    };

    const handleVersionSelection = (version) => {
        setSelectedVersion(version);
        setSelectedTask(null);
        setSelectedEndpoint(null);
    };

    const handleTaskSelection = (task) => {
        setSelectedTask(task);
    };

    const handleQueryTypeSelection = (queryType) => {
        setSelectedQueryType(queryType);
    };

    async function handleQuery(payload) {
        const response = await servicesService.queryService(
            accessToken,
            selectedType,
            selectedVersion,
            selectedTask,
            selectedEndpoint.textBased,
            payload
        );

        console.log(response);
    }

    return (
        <div className="service-selection-container">
            <div className="selections">
                <div className="type-selection">
                    <button
                        id="type-selection-btn"
                        onClick={() => {
                            toggleType();
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
                        {!typeLoaded ? (
                            <BounceLoader
                                cssOverride={loader}
                                color="var(--color-compliment)"
                                size="30px"
                            />
                        ) : types.length !== 0 ? (
                            types.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeSelection(type)}
                                    className={
                                        type === selectedType ? "active" : ""
                                    }
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
                            {!versionLoaded ? (
                                <BounceLoader
                                    cssOverride={loader}
                                    color="var(--color-compliment)"
                                    size="30px"
                                />
                            ) : versions.length !== 0 ? (
                                versions.map((version) => (
                                    <button
                                        key={version}
                                        onClick={() =>
                                            handleVersionSelection(version)
                                        }
                                        className={
                                            version === selectedVersion
                                                ? "active"
                                                : ""
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
                            {!taskLoaded ? (
                                <BounceLoader
                                    cssOverride={loader}
                                    color="var(--color-compliment)"
                                    size="30px"
                                />
                            ) : tasks.length !== 0 ? (
                                tasks.map((task) => (
                                    <button
                                        key={task}
                                        onClick={() =>
                                            handleTaskSelection(task)
                                        }
                                        className={
                                            task === selectedTask
                                                ? "active"
                                                : ""
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
                    {selectedEndpoint.textBased ? (
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
                    ) : (
                        <div className="query-type-options">
                            {selectedEndpoint.supportedFormats.map(
                                (supportedFormat, index) => (
                                    <button
                                        key={index}
                                        id={"query-upload-btn-" + index}
                                        className={
                                            index === nonTextBasedQueryOption
                                                ? "query-upload-btn active"
                                                : "query-upload-btn"
                                        }
                                        onClick={(e) => {
                                            document
                                                .getElementById(
                                                    e.currentTarget.id
                                                )
                                                .classList.add("active");
                                            setNonTextBasedQueryOption(index);
                                        }}
                                    >
                                        {"Upload " +
                                            supportedFormat.substring(0, 1) +
                                            supportedFormat
                                                .substring(1)
                                                .toLowerCase()}
                                    </button>
                                )
                            )}
                        </div>
                    )}
                    <div className="query-wrapper">
                        {selectedEndpoint.textBased ? (
                            <>
                                <div id="query-gui" className="query-gui">
                                    <QueryGUI
                                        options={selectedEndpoint.options}
                                        onSubmit={(payload) =>
                                            handleQuery(payload)
                                        }
                                    />
                                </div>
                                <div id="query-cli" className="query-cli">
                                    <QueryCLI
                                        options={selectedEndpoint.options}
                                    />
                                </div>
                            </>
                        ) : (
                            <div id="query-upload" className="query-upload">
                                {selectedEndpoint.supportedFormats.map(
                                    (supportedFormat, index) =>
                                        index === nonTextBasedQueryOption && (
                                            <div
                                                key={index}
                                                className="query-upload-wrapper"
                                            >
                                                <QueryUpload
                                                    index={index}
                                                    supportedFormats={[
                                                        supportedFormat,
                                                    ]}
                                                />
                                            </div>
                                        )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
