import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/sections/ServicesList.css";
import { useDispatch, useSelector } from "react-redux";
import ServicesService from "../../services/ServicesService.js";
import UIService from "../../services/UIServices.js";
import { setLoaded } from "../../store/actions";
import Selector from "../utils/Selector";
import noResultBg from "../../img/no-result-pic.png";
import { BounceLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

export default function ServicesList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const servicesService = useMemo(() => {
        return new ServicesService({ dispatch });
    }, [dispatch]);
    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);
    const dataLoaded = useSelector((state) => state.loaded);
    const role = useSelector((state) => state.role);

    const [currentPage, setCurrentPage] = useState(1);
    const [servicesPerPage] = useState(5);
    const [filterType, setFilterType] = useState("All Types");
    const [orderType, setOrderType] = useState("");
    const [serviceTypes, setServiceTypes] = useState([]);
    const [services, setServices] = useState(null);
    const [filteredServices, setFilteredServices] = useState(null);
    const [displayedServices, setDisplayedServices] = useState(null);
    const [activeButtonId, setActiveButtonId] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const loader = {
        position: "absolute",
        display: "flex",
        marginLeft: "40%",
        marginTop: "25rem",
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        const fetchServiceTypes = async () => {
            dispatch(setLoaded(false));
            const response = await servicesService.retrieveServicesTypes(
                accessToken
            );

            switch (response[0]) {
                case 200:
                    setServiceTypes(response[1].types);
                    break;
                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
        };

        const fetchServices = async () => {
            dispatch(setLoaded(false));
            const response = await servicesService.retrieveServices(
                accessToken
            );

            switch (response[0]) {
                case 200:
                    setServices(response[1].services);
                    setFilteredServices(response[1].services);
                    break;
                default:
                    uiService.setErrorMsg(response[1].message);
                    break;
            }
        };
        fetchServiceTypes();
        fetchServices();
    }, []);

    useEffect(() => {
        if (services !== null && filteredServices !== null) {
            dispatch(setLoaded(true));
        }
    }, [services, filteredServices]);

    useEffect(() => {
        if (dataLoaded) {
            if (filterType !== "" && filterType !== "All Types") {
                setFilteredServices(
                    services.filter((service) => service.type === filterType)
                );
            } else {
                setFilteredServices(services);
            }
        }
    }, [filterType, dataLoaded, services]);

    useEffect(() => {
        if (dataLoaded) {
            if (orderType !== "") {
                const sortedServices = [...filteredServices];

                if (orderType.includes("Ascending")) {
                    sortedServices.sort((a, b) => (a.name < b.name ? -1 : 1));
                } else {
                    sortedServices.sort((a, b) => (a.name > b.name ? -1 : 1));
                }

                setFilteredServices(sortedServices);
            }
        }
    }, [orderType, dataLoaded]);

    useEffect(() => {
        if (filteredServices !== null) {
            const startIndex = (currentPage - 1) * servicesPerPage;
            const endIndex = startIndex + servicesPerPage;
            const currentServices = filteredServices.slice(
                startIndex,
                endIndex
            );
            setDisplayedServices(currentServices);
        }
    }, [filteredServices, currentPage, servicesPerPage]);

    const renderPaginationNumbers = () => {
        if (!services) {
            return [];
        }
        const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
        const maxShownPages = 5;
        let returnedPagination = [];

        if (totalPages < maxShownPages) {
            for (let i = 1; i <= totalPages; i++) {
                returnedPagination.push(i);
            }
            return addDotsBetweenIntegers(returnedPagination);
        }

        if (currentPage === totalPages) {
            return addDotsBetweenIntegers([
                1,
                2,
                currentPage - 2,
                currentPage - 1,
                currentPage,
            ]);
        }

        if (currentPage === 1) {
            return addDotsBetweenIntegers([
                1,
                2,
                3,
                totalPages - 1,
                totalPages,
            ]);
        }

        returnedPagination.push(1);
        returnedPagination.push(currentPage);
        returnedPagination.push(currentPage + 1);

        if (currentPage === 2) {
            returnedPagination.push(currentPage + 2);
        } else {
            returnedPagination.push(currentPage - 1);
        }

        if (currentPage + 1 === totalPages) {
            returnedPagination.push(currentPage - 2);
            returnedPagination.sort((a, b) => a > b);
            return addDotsBetweenIntegers(returnedPagination);
        } else {
            returnedPagination.push(totalPages);
            returnedPagination.sort((a, b) => a > b);
            return addDotsBetweenIntegers(returnedPagination);
        }
    };

    function addDotsBetweenIntegers(arr) {
        const result = [];

        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);

            if (i < arr.length - 1 && arr[i] + 1 !== arr[i + 1]) {
                result.push("...");
            }
        }

        return result;
    }

    function handleActionDropDown(e) {
        const id = e.currentTarget.id.split("-")[2];
        const div = "actions-drop-down-" + id;
        if (activeButtonId === id) {
            setActiveButtonId(-1);
            document.getElementById(div).style.display = "none";
        } else {
            setActiveButtonId(id);
        }
    }

    function handleNavigate(e) {
        const action = e.currentTarget.id.split("-")[0];
        const id = e.currentTarget.id.split("-")[2];
        console.log(document.getElementById("service-type-" + id));
        const type = document.getElementById("service-type-" + id).textContent;
        const version = document.getElementById(
            "service-version-" + id
        ).textContent;

        if (action !== "remove") {
            navigate("/" + action + "/" + type + "/" + version);
        } else {
        }
    }

    useEffect(() => {
        if (activeButtonId) {
            const allActionDivs = document.querySelectorAll(
                '[id^="actions-drop-down-"]'
            );
            allActionDivs.forEach((actionDiv) => {
                const id = actionDiv.id.split("-")[3];
                console.log(id === activeButtonId, id, activeButtonId);
                actionDiv.style.display =
                    id === activeButtonId ? "flex" : "none";
            });
        }
    }, [activeButtonId]);

    useEffect(() => {
        setActiveButtonId(-1);
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    return (
        <div className="services-list-container">
            {!dataLoaded ? (
                <BounceLoader
                    cssOverride={loader}
                    color="var(--color-compliment)"
                />
            ) : (
                <>
                    <div className="services-list-filters">
                        <label className="filters">
                            <Selector
                                options={[
                                    { value: "All Types", label: "All Types" },
                                    ...serviceTypes.map((type) => ({
                                        value: type,
                                        label: type,
                                    })),
                                ]}
                                onSelect={(value) => setFilterType(value)}
                                defaultSelect={"All Types"}
                            />
                        </label>
                        <label className="filters">
                            <Selector
                                options={[
                                    {
                                        value: "Ascending Order",
                                        label: "Ascending Order",
                                    },
                                    {
                                        value: "Descending Order",
                                        label: "Descending Order",
                                    },
                                ]}
                                onSelect={(value) => setOrderType(value)}
                                defaultSelect={"Ascending Order"}
                            />
                        </label>
                    </div>

                    <div className="services-list-table">
                        <ul className="services-table-title">
                            <li id="index-title">#</li>
                            <li id="name-title">Service</li>
                            <li id="type-title">Type</li>
                            <li id="version-title">Version</li>
                            <li id="action-title"> </li>
                        </ul>
                        {displayedServices && displayedServices.length !== 0 ? (
                            <div className="services-table-content">
                                {displayedServices.map((service, index) => (
                                    <ul key={index}>
                                        <li className="service-index-value">
                                            {(currentPage - 1) *
                                                servicesPerPage +
                                                (index + 1)}
                                        </li>
                                        <li className="service-name-desc-value">
                                            <span
                                                className="service-name-value"
                                                title={service.name}
                                            >
                                                {service.name}
                                            </span>
                                            <span
                                                className="service-desc-value"
                                                title={service.description}
                                            >
                                                {service.description}
                                            </span>
                                        </li>
                                        <li
                                            id={
                                                "service-type-" +
                                                ((currentPage - 1) *
                                                    servicesPerPage +
                                                    (index + 1))
                                            }
                                            className="service-type-value"
                                        >
                                            {service.type}
                                        </li>
                                        <li
                                            id={
                                                "service-version-" +
                                                ((currentPage - 1) *
                                                    servicesPerPage +
                                                    (index + 1))
                                            }
                                            className="service-version-value"
                                        >
                                            {service.version}
                                        </li>
                                        <li className="service-action">
                                            <button
                                                id={
                                                    "action-button-" +
                                                    ((currentPage - 1) *
                                                        servicesPerPage +
                                                        (index + 1))
                                                }
                                                onClick={(e) =>
                                                    handleActionDropDown(e)
                                                }
                                            >
                                                <i className="fa-solid fa-ellipsis-vertical"></i>
                                            </button>
                                            <div
                                                id={
                                                    "actions-drop-down-" +
                                                    ((currentPage - 1) *
                                                        servicesPerPage +
                                                        (index + 1))
                                                }
                                                className="actions-drop-down"
                                            >
                                                {role === "admin" && (
                                                    <button
                                                        id={
                                                            "remove-service-" +
                                                            ((currentPage - 1) *
                                                                servicesPerPage +
                                                                (index + 1))
                                                        }
                                                        onClick={(e) =>
                                                            handleNavigate(e)
                                                        }
                                                    >
                                                        Remove service
                                                    </button>
                                                )}
                                                <button
                                                    id={
                                                        "query-service-" +
                                                        ((currentPage - 1) *
                                                            servicesPerPage +
                                                            (index + 1))
                                                    }
                                                    onClick={(e) =>
                                                        handleNavigate(e)
                                                    }
                                                    title="Query Service"
                                                >
                                                    {windowWidth >= 720 ? (
                                                        "Query Service"
                                                    ) : (
                                                        <i className="fa-solid fa-comment"></i>
                                                    )}
                                                </button>
                                                <button
                                                    id={
                                                        "stats-service-" +
                                                        ((currentPage - 1) *
                                                            servicesPerPage +
                                                            (index + 1))
                                                    }
                                                    onClick={(e) =>
                                                        handleNavigate(e)
                                                    }
                                                    title="View Statistics"
                                                >
                                                    {windowWidth >= 720 ? (
                                                        "View Statistics"
                                                    ) : (
                                                        <i className="fa-solid fa-chart-line"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        ) : (
                            <div className="no-result-display">
                                <img src={noResultBg} />
                                <span>
                                    Oops! No fish in this sea. This seems
                                    fishy... 🐟🎣
                                </span>
                            </div>
                        )}
                    </div>

                    <ul className="pagination">
                        {renderPaginationNumbers().map((pageNumber, index) => (
                            <li key={index}>
                                {Number.isInteger(pageNumber) ? (
                                    <button
                                        id={"pagination-btn-num-" + pageNumber}
                                        onClick={() => paginate(pageNumber)}
                                        className={
                                            currentPage === pageNumber
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {pageNumber}
                                    </button>
                                ) : (
                                    <span>{pageNumber}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
