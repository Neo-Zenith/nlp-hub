import React, { useState } from "react";
import "../../styles/components/sections/QueryUpload.css";

export default function QueryUpload({ supportedFormats, onSubmit, index }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    function convertFormatsToExtensions(supportedFormats) {
        const formatExtensions = {
            IMAGE: [".jpg", ".png"],
            AUDIO: [".mp3", ".wav"],
            VIDEO: [".mp4", ".avi"],
            PDF: [".pdf"],
        };

        const extensions = supportedFormats.flatMap(
            (format) => formatExtensions[format]
        );
        return extensions;
    }

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
                <span>Uplodable</span>
                <div className="file-input">
                    <input
                        type="file"
                        id={"queryFile" + index}
                        name="queryFile"
                        accept={convertFormatsToExtensions(supportedFormats)}
                        onChange={handleFileChange}
                    />
                    <span>Upload a file:</span>
                    <div className="query-actions">
                        {!selectedFile ? (
                            <label htmlFor={"queryFile" + index}>
                                <i className="fa-regular fa-file"></i>
                            </label>
                        ) : (
                            <button
                                className="cancel-upload"
                                onClick={() => setSelectedFile(null)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        )}
                    </div>
                </div>
                {selectedFile && (
                    <div className="uploaded-file">
                        <div className="uploaded-file-name">
                            <label>File name: </label>
                            <span>{selectedFile.name}</span>
                        </div>
                        <div className="uploaded-file-size">
                            <label>File size: </label>
                            <span>{selectedFile.size / 1000} KB</span>
                        </div>
                    </div>
                )}
            </div>
            <button className="upload-btn" type="submit" onClick={handleSubmit}>
                Upload
            </button>
        </div>
    );
}
