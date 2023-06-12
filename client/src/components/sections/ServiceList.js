import React, { useEffect, useState } from "react";
import "../../styles/components/sections/ServicesList.css";

const servicesData = [
    {
        name: "Service A",
        description: "Description A",
        type: "SUD",
        version: "1.0",
    },
    {
        name: "Service B",
        description: "Description B",
        type: "NER",
        version: "2.0",
    },
    {
        name: "Service C",
        description: "Description C",
        type: "SUD",
        version: "1.5",
    },
    {
        name: "Service D",
        description: "Description D",
        type: "NER",
        version: "3.0",
    },
    {
        name: "Service D",
        description: "Description D",
        type: "NER",
        version: "3.0",
    },
    {
        name: "Service D",
        description: "Description D",
        type: "NER",
        version: "3.0",
    },
    {
        name: "Service D",
        description: "Description D",
        type: "NER",
        version: "3.0",
    },
    // Add more services as needed
];

const ServicesList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [servicesPerPage] = useState(5); // Number of services per page
    const [filterType, setFilterType] = useState("");

    // Get unique service types for the dropdown
    const serviceTypes = [
        ...new Set(servicesData.map((service) => service.type)),
    ];

    // Filter services based on type
    const filteredServices = filterType
        ? servicesData.filter((service) => service.type === filterType)
        : servicesData;

    // Pagination
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(
        indexOfFirstService,
        indexOfLastService
    );

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

            <div className="services-list">
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
                    {currentServices.map((service, index) => (
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
};

export default ServicesList;
