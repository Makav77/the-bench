import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import "./i18n";
import Login from './components/Login/Login'
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import Homepage from "./components/Homepage/Homepage";
import Layout from "./components/Layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import EventsPage from "./components/Events/EventsPage";
import EventDetailPage from "./components/Events/EventDetailPage";
import { PublicRoute } from "./components/Utils/PublicRoute";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import CreateEventPage from "./components/Events/CreateEventPage";

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route element={<PublicRoute />}>
                                <Route path="/" element={<Login />} />
                                <Route path="register" element={<Register />} />
                                <Route path="resetpassword" element={<ResetPassword />} />
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route path="homepage" element={<Homepage />} />
                                <Route path="events" element={<EventsPage />} />
                                <Route path="events/:id" element={<EventDetailPage />} />
                                <Route path="events/create" element={<CreateEventPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </React.StrictMode>
    );
}
