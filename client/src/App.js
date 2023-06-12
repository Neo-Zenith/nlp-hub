import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignupPage } from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path=":username" element={<AccountDetailsPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/services" element={<ServiceDetailsPage />} />
                </Routes>
            </Router>
        </>
    );
}
