import { Component } from "react";
import {
    setAccessToken,
    setUsername,
    setRole,
    setExpiry,
    setSidebarActive,
} from "../store/actions";

export default class UsersService extends Component {
    async loginUser(username, password) {
        const { dispatch } = this.props;
        const url = "https://nlphub.azurewebsites.net/users/login";

        const requestBody = {
            username: username,
            password: password,
        };

        const response = await fetch(url, {
            mode: "cors",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        switch (response.status) {
            case 201:
                const { accessToken } = data;
                dispatch(setAccessToken(accessToken));
                dispatch(setUsername(username));
                dispatch(setRole("user"));
                return [response.status, true];

            default:
                return [response.status, data];
        }
    }

    async registerUser(username, name, email, password, department) {
        const url = "https://nlphub.azurewebsites.net/users/register";

        const requestBody = {
            username: username,
            password: password,
            name: name,
            email: email,
            department: department,
        };

        const response = await fetch(url, {
            mode: "cors",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        switch (response.status) {
            case 201:
                await this.loginUser(username, password);
                return [response.status, true];

            default:
                const payload = await response.json();
                return [response.status, payload];
        }
    }

    async retrieveUser(username, accessToken) {
        const { dispatch } = this.props;
        const url = "https://nlphub.azurewebsites.net/users/";
        const fullUrl = url + username;

        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer " + accessToken,
            },
        });

        const payload = await response.json();
        if (response.status === 200) {
            dispatch(setExpiry(payload.subscriptionExpiryDate));
        }
        return [response.status, payload];
    }

    async updateUser(updatePackage, username, accessToken) {
        const url = "https://nlphub.azurewebsites.net/users/";
        const fullUrl = url + username;
        const { dispatch } = this.props;

        const response = await fetch(fullUrl, {
            mode: "cors",
            method: "PUT",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify(updatePackage),
        });

        switch (response.status) {
            case 200:
                if (updatePackage.username) {
                    dispatch(setUsername(updatePackage.username));
                }
                return [response.status, true];

            default:
                const payload = await response.json();
                return [response.status, payload];
        }
    }

    logoutUser() {
        const { dispatch } = this.props;
        dispatch(setUsername(null));
        dispatch(setRole(null));
        dispatch(setAccessToken(null));
        dispatch(setSidebarActive(false));
        return true;
    }

    decodeAccessToken(accessToken) {
        const tokenParts = accessToken.split(".");
        const encodedPayload = tokenParts[1];
        const decodedPayload = atob(encodedPayload);

        const payloadObject = JSON.parse(decodedPayload);
        return payloadObject;
    }

    validateTokenExpiry(accessToken) {
        const tokenPayload = this.decodeAccessToken(accessToken);
        const expTime = tokenPayload.exp;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (expTime < currentTimestamp) {
            this.logoutUser();
            return false;
        }
        return true;
    }
}
