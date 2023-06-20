import { Component } from "react";

export default class ServicesService extends Component {
    async retrieveUsages(accessToken) {
        const url = "https://nlphub.azurewebsites.net/usages";
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
