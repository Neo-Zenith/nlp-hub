import { Component } from "react";

export class UsersService extends Component {
    async loginUser(username, password) {
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

        switch (response.status) {
            case 401:
                return false;

            case 201:
                const data = await response.json();
                const { accessToken } = data;
                return accessToken;
        }
    }

    async registerUser(username, name, email, password, department) {
        const url = "https://nlphub.azurewebsites.net/users/register";

        const requestBody = {
            username: "User01",
            password: "password123",
            name: "John Doe",
            email: "test@example.com",
            department: "SCSE",
        };

        const response = await fetch(url, {
            mode: "cors",
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        console.log(response);
        switch (response.status) {
            case 409:
                return response.json();

            case 201:
                await response.json();
                return true;
        }
    }
}
