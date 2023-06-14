import { Component } from "react";

export default class ServicesService extends Component {
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

    async retrieveServicesVersions(accessToken, type) {
        const url =
            "https://nlphub.azurewebsites.net/services/" +
            type +
            "/get-version";
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

    async retrieveServicesEndpoints(accessToken, type, version) {
        const url =
            "https://nlphub.azurewebsites.net/services/" +
            type +
            "/" +
            version +
            "/endpoints";
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
