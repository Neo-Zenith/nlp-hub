import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignupPage } from "./pages/SignupPage";

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/signup" element={<SignupPage />} />
                </Routes>
            </Router>
        </>
    );
}
