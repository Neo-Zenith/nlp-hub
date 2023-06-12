import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/sections/ServicesList.css";
import { useDispatch, useSelector } from "react-redux";
import ServicesService from "../../services/ServicesService.js";
import UIService from "../../services/UIServices.js";
import { setLoaded } from "../../store/actions";

export default function ServicesList() {
    const dispatch = useDispatch();

    const servicesService = useMemo(() => {
        return new ServicesService({ dispatch });
    }, [dispatch]);
    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const accessToken = useSelector((state) => state.accessToken);
    const dataLoaded = useSelector((state) => state.loaded);

    const [currentPage, setCurrentPage] = useState(1);
    const [servicesPerPage] = useState(4);
    const [filterType, setFilterType] = useState("");
    const [orderType, setOrderType] = useState("");
    const [serviceTypes, setServiceTypes] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);

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
        dispatch(setLoaded(true));
    }, []);

    useEffect(() => {
        if (dataLoaded) {
            if (filterType !== "" && filterType !== "All") {
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
    }, [orderType, dataLoaded, filteredServices]);

    const renderPaginationNumbers = () => {
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

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    return (
        <div className="services-list-container">
            <span className="services-list-title">Services</span>

            <div className="services-list-filters">
                <label className="filters">
                    Filter by Type:
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All</option>
                        {serviceTypes.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="filters">
                    Order by Name:
                    <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                    >
                        <option value="Ascending Order (A - Z)">
                            Ascending Order (A - Z)
                        </option>
                        <option value="Descending Order (Z - A)">
                            Descending Order (Z - A)
                        </option>
                    </select>
                </label>
            </div>

            <div className="services-list-table">
                <ul className="services-table-title">
                    <li id="index-title">#</li>
                    <li id="name-title">Name</li>
                    <li id="desc-title">Description</li>
                    <li id="type-title">Type</li>
                    <li id="version-title">Version</li>
                    <li id="action-title"> </li>
                </ul>
                <div className="services-table-content">
                    {filteredServices.map((service, index) => (
                        <ul key={index}>
                            <li className="service-index-value">
                                {(currentPage - 1) * servicesPerPage +
                                    (index + 1)}
                            </li>
                            <li className="service-name-value">
                                {service.name}
                            </li>
                            <li className="service-desc-value">
                                {service.description}
                            </li>
                            <li className="service-type-value">
                                {service.type}
                            </li>
                            <li className="service-version-value">
                                {service.version}
                            </li>
                            <li className="service-action">
                                <button>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                            </li>
                        </ul>
                    ))}
                </div>
            </div>

            <ul className="pagination">
                {renderPaginationNumbers().map((pageNumber, index) => (
                    <li key={index}>
                        {Number.isInteger(pageNumber) ? (
                            <button
                                id={"pagination-btn-num-" + pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={
                                    currentPage === pageNumber ? "active" : ""
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
        </div>
    );
}
