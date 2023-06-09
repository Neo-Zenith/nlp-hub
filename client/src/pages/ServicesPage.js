import React from "react";
import { ServicesList } from "../components/ServicesList";
import { MenuComponent } from "../components/Menu";
import { TopBar } from "../components/TopBar";
import "../styles/pages/ServicesPage.css";

export function ServicesPage() {
    return (
        <>
            <div className="services-page-wrapper">
                <MenuComponent />
                <div className="services-page-content">
                    <TopBar />
                    <div className="page-navigation">
                        <span>
                            <a href="/">
                                <i className="fa-solid fa-house"></i>
                            </a>
                        </span>
                        &nbsp;/&nbsp;
                        <span>
                            <a href="/services">Available Services</a>
                        </span>
                    </div>
                    <div className="services-details">
                        <ServicesList />
                    </div>
                </div>
            </div>
        </>
    );
}
