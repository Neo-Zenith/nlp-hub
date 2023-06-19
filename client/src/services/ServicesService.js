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

    async queryService(accessToken, type, version, task, textBased, payload) {
        const url =
            "https://nlphub.azurewebsites.net/query/" +
            type +
            "/" +
            version +
            "/" +
            task;

        const contentType = textBased
            ? "application/json"
            : "multipart/form-data";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": contentType,
                authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify(payload),
        });

        const resPayload = await response.json();
        return [response.status, resPayload];
    }
}
