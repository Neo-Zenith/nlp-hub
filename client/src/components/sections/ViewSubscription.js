import React from "react";
import "../../styles/components/sections/ViewSubscription.css";
import { useSelector } from "react-redux";

export default function ViewSubscription() {
    const expiry = useSelector((state) => state.expiry);

    function convertToUserTimezone(dateString) {
        if (dateString === null) {
            return;
        }
        const updatedDateString = dateString.replace("T", " ");
        const date = new Date(updatedDateString);
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const options = {
            timeZone: userTimezone,
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        };
        const formattedDate = date.toLocaleString(undefined, options);
        const formattedDateWithoutAt = formattedDate.replace("at", "");
        return formattedDateWithoutAt.trim();
    }

    return (
        <>
            <div className="subscription-card-container">
                <div className="card">
                    <div className="card-content">
                        <p className="card-para">
                            Your subscription expires at:
                        </p>
                        <p className="card-title">
                            {convertToUserTimezone(expiry)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
