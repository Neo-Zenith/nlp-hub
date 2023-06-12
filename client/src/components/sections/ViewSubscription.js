import React from "react";
import "../../styles/components/sections/ViewSubscription.css";
import { useSelector } from "react-redux";

export default function ViewSubscription() {
    const expiry = useSelector((state) => state.expiry);

    function convertToUserTimezone(dateString) {
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
                <div class="card">
                    <div class="card-content">
                        <p class="card-para">Your subscription expires at:</p>
                        <p class="card-title">
                            {convertToUserTimezone(expiry)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
