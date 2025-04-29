import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const PublicRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/homepage" replace /> : <Outlet />;
}
