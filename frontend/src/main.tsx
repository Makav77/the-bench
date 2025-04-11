import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import "./i18n";
import Login from './components/Login/Login'
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword";

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="resetpassword" element={<ResetPassword />} />
                </Routes>
            </BrowserRouter>
        </React.StrictMode>
    );
}
