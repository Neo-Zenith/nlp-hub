import React, { useEffect, useState } from "react";

function App() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(
                "https://nlphub.azurewebsites.net/admins/login"
            );
            const data = await response.json();
            console.log(response.status, data);
        }

        fetchData();
    }, []);

    return (
        <div className="App">
            <h1>Services:</h1>
            <ul></ul>
        </div>
    );
}

export default App;
