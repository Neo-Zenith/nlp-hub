import React, { useEffect, useMemo, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import { ServicesService } from "../services/ServicesService";
import { useDispatch, useSelector } from "react-redux";
import noResultImg from "../img/no-result-pic.png";
import "../styles/components/ServicesList.css";

export function ServicesList() {
    const dispatch = useDispatch();

    const servicesService = useMemo(() => {
        return new ServicesService(dispatch);
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);

    const [dataLoaded, setDataLoaded] = useState(false);
    const [typeFilterActive, setTypeFilterActive] = useState(false);
    const [typeFilter, setTypeFilter] = useState("");
    const [nameFilter, setNameFilter] = useState("");
    const [nameFilterActive, setNameFilterActive] = useState(false);
    const [filteredServices, setFilteredServices] = useState(null);
    const [services, setServices] = useState(null);
    const [serviceTypes, setServiceTypes] = useState(null);

    const closeTypeFilter = (e) => {
        const value = e.target.textContent;
        const id = "filter-type";
        setTypeFilter(value);
        document.getElementById(id).style.display = "none";
        document.getElementById(id).style.transform =
            "translate(34.5rem, 2rem)";
        document.getElementById(id + "-text").style.fontWeight = "bold";
        setTypeFilterActive(false);
    };

    const closeNameFilter = (e) => {
        const value = e.target.textContent;
        const id = "filter-name";
        setNameFilter(value);
        console.log(nameFilter);
        document.getElementById(id).style.display = "none";
        document.getElementById(id).style.transform =
            "translate(48.5rem, 2rem)";
        document.getElementById(id + "-text").style.fontWeight = "bold";
        setNameFilterActive(false);
    };

    const handleFilterDropDown = (e) => {
        const field = e.currentTarget.id.split("-")[1];
        if (field === "type") {
            const id = "filter-" + field;
            if (!typeFilterActive) {
                document.getElementById(id).style.display = "flex";
                document.getElementById(id).style.transform =
                    "translate(39.5rem, 4rem)";
                setTypeFilterActive(true);
            } else {
                document.getElementById(id).style.display = "none";
                document.getElementById(id).style.transform =
                    "translate(39.5rem, 2rem)";
                setTypeFilterActive(false);
            }
        } else {
            const id = "filter-" + field;
            if (!nameFilterActive) {
                document.getElementById(id).style.display = "flex";
                document.getElementById(id).style.transform =
                    "translate(48.5rem, 4rem)";
                setNameFilterActive(true);
            } else {
                document.getElementById(id).style.display = "none";
                document.getElementById(id).style.transform =
                    "translate(48.5rem, 2rem)";
                setNameFilterActive(false);
            }
        }
    };

    useEffect(() => {
        async function fetchServices() {
            const response = await servicesService.retrieveServices(
                accessToken
            );
            setServices(response[1].services);
            setFilteredServices(response[1].services);
        }

        async function fetchServicesTypes() {
            const response = await servicesService.retrieveServicesTypes(
                accessToken
            );
            const allTypes = response[1].types.concat(["All"]);
            setServiceTypes(allTypes);
        }

        fetchServices();
        fetchServicesTypes();
    }, []);

    useEffect(() => {
        setDataLoaded(false);
        if (typeFilter !== "" && typeFilter !== "All") {
            let filteredServices = [];
            for (const service of services) {
                if (service.type === typeFilter) {
                    filteredServices.push(service);
                }
            }

            setFilteredServices(filteredServices);
        } else {
            setFilteredServices(services);
        }
    }, [typeFilter]);

    useEffect(() => {
        setDataLoaded(false);
        if (nameFilter.includes("Ascending")) {
            setFilteredServices(
                filteredServices.sort((a, b) => a.name.localeCompare(b.name))
            );
        } else if (nameFilter.includes("Descending")) {
            setFilteredServices(
                filteredServices.sort((a, b) => b.name.localeCompare(a.name))
            );
        }
    }, [nameFilter]);

    useEffect(() => {
        if (services !== null && serviceTypes !== null && filteredServices !== null) {
            setDataLoaded(true);
        }
    }, [services, serviceTypes, filteredServices]);

    return (
        <>
            <div className="services-list-container">
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
                    <div className="services-list">
                        <div className="header">
                            <div className="title">
                                <span>Services</span>
                            </div>
                            <div className="filters">
                                <button
                                    id="filter-type-btn"
                                    onClick={handleFilterDropDown}
                                >
                                    <span id="filter-type-text">
                                        {typeFilter !== ""
                                            ? "Type: " + typeFilter
                                            : "Filter by Type"}
                                    </span>
                                    <i className="fa-solid fa-caret-down"></i>
                                </button>

                                <button
                                    id="filter-name-btn"
                                    onClick={handleFilterDropDown}
                                >
                                    <span id="filter-name-text">
                                        {nameFilter !== ""
                                            ? "Name: " + nameFilter
                                            : "Filter by Name"}
                                    </span>
                                    <i className="fa-solid fa-caret-down"></i>
                                </button>
                            </div>
                            <ul id="filter-type" className="service-types">
                                {serviceTypes.map((type, index) => (
                                    <li key={index}>
                                        <button onClick={closeTypeFilter}>
                                            <span>{type}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <ul id="filter-name" className="filter-by-name">
                                <li>
                                    <button onClick={closeNameFilter}>
                                        <span>Ascending (A - Z)</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={closeNameFilter}>
                                        <span>Descending (Z - A)</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <ul className="services">
                            {filteredServices.length !== 0 ? (
                                <>
                                    <ul className="services-list-title">
                                        <li>Name</li>
                                        <li>Type</li>
                                        <li>Version</li>
                                        <li>Description</li>
                                    </ul>

                                    {filteredServices.map((service) => (
                                        <ul
                                            key={service.id}
                                            className="service-item"
                                        >
                                            <li>
                                                <span>{service.name}</span>
                                            </li>
                                            <li>
                                                <span>{service.type}</span>
                                            </li>
                                            <li>
                                                <span>{service.version}</span>
                                            </li>
                                            <li>
                                                <span>
                                                    {service.description}
                                                </span>
                                            </li>
                                            <li>
                                                <button className="more-actions">
                                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    ))}
                                </>
                            ) : (
                                <div className="no-results">
                                    <img src={noResultImg} alt="No results" />
                                    <span>
                                        Oops! We are unable to find any matching
                                        results.
                                    </span>
                                </div>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
