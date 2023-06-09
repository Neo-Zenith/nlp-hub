import React, { Component } from "react";

export class ServicesService extends Component {
    async retrieveServices(accessToken) {
        const url = "https://nlphub.azurewebsites.net/services";
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer " + accessToken,
            },
        });
        const payload = await response.json();
        return [response.status, payload];
    }

    async retrieveServicesTypes(accessToken) {
        const url = "https://nlphub.azurewebsites.net/services/get-types";
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer " + accessToken,
            },
        });

        const payload = await response.json();
        return [response.status, payload];
    }
}
