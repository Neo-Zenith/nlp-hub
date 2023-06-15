import React, { useEffect, useState } from "react";

export default function QueryCLI({ options }) {
    const [currentOptions, setCurrentOptions] = useState(null);

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
    };

    useEffect(() => {
        setCurrentOptions(options);
    }, [options]);

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        try {
            const parsedValue = JSON.parse(inputValue);
            setCurrentOptions(parsedValue);
        } catch (error) {
            // Handle error when parsing invalid JSON input
            setCurrentOptions(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="jsonInput">JSON Input:</label>
            <textarea
                id="jsonInput"
                name="jsonInput"
                rows="5"
                cols="50"
                value={JSON.stringify(currentOptions, null, 2)} // Render options literally as JSON
                onChange={handleInputChange} // Update currentOptions state when input changes
            />
            <button type="submit">Submit</button>
        </form>
    );
}
