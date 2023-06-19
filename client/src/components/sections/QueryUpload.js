import React, { useState } from "react";
import "../../styles/components/sections/QueryUpload.css";

export default function QueryUpload({ supportedFormats, onSubmit }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError("");
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onSubmit(selectedFile);
        } else {
            setError("Please select a file to upload.");
        }
    };

    return (
        <div className="query-upload-wrapper">
            <div className="query-upload-container">
                <span>Upload Query File</span>
                <div className="file-input">
                    <input
                        type="file"
                        id="queryFile"
                        name="queryFile"
                        accept={`.${supportedFormats.join(", .")}`}
                        onChange={handleFileChange}
                    />
                    <label htmlFor="queryFile">Choose a file</label>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
            <button className="upload-btn" type="submit" onClick={handleSubmit}>
                Upload
            </button>
        </div>
    );
}
