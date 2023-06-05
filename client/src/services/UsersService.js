import { Component } from "react";

export class UsersService extends Component {
    async loginUser(username, password) {
        const url = "https://nlphub.azurewebsites.com/users/login";

        const requestBody = {
            username: username,
            password: password,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            // Handle the response data here
            console.log(data);
        } catch (error) {
            // Handle any errors that occur during the request
            console.error("Error:", error);
        }
    }
}
