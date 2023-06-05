import { Component } from "react";

export class UsersService extends Component {
    async loginUser(username, password) {
        const url = "https://nlphub.azurewebsites.com/users/login";

        const requestBody = {
            username: username,
            password: password,
        };

        try {
            const response = await fetch(
                "https://nlphub.azurewebsites.net/admins/login"
            );
            const data = await response.json();
            console.log(response.status, data);
        } catch (error) {
            // Handle any errors that occur during the request
            console.error("Error:", error);
        }
    }
}
