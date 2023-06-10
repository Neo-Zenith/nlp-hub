import { useEffect, useMemo } from "react";
import SignupForm from "../components/forms/SignupForm";
import "../styles/pages/SignupPage.css";
import { useDispatch, useSelector } from "react-redux";
import UIService from "../services/UIServices";

export function SignupPage() {
    const dispatch = useDispatch();

    const error = useSelector((state) => state.error);

    const uiServices = useMemo(() => {
        return new UIService({ dispatch });
    });

    useEffect(() => {
        console.log(error);
        uiServices.displayErrorMsg(error);
    }, [error]);

    return (
        <>
            <div className="signup-form-wrapper">
                <SignupForm />
            </div>
        </>
    );
}
