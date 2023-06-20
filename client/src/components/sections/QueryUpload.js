import React, { useMemo, useState } from "react";
import "../../styles/components/sections/QueryUpload.css";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../../services/UIServices";

export default function QueryUpload({ supportedFormats, onSubmit, index }) {
    const dispatch = useDispatch();

    const error = useSelector((state) => state.error);

    const uiService = useMemo(() => {
        return new UIService({ dispatch });
    }, [dispatch]);

    const [selectedFile, setSelectedFile] = useState(null);

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
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onSubmit(selectedFile);
        } else {
            uiService.setErrorMsg("Please select a file to upload.");
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
                    <span>
                        {!selectedFile
                            ? "Attach a file:"
                            : "Remove attachment:"}
                    </span>
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
