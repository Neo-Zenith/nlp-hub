import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountPage } from "./pages/AccountPage";
import { ServicesPage } from "./pages/ServicesPage";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/user/:username" element={<AccountPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
