import React, { useEffect, useState } from "react";

function App() {
    const [services, setServices] = useState([]);
    const message = "&lt;script></script>"

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
            <h1>{message}</h1>
            <ul></ul>
        </div>
    );
}

export default App;
