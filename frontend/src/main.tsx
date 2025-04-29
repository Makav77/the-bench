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
//import { PublicRoute } from "./components/Utils/PublicRoute";

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Login />} />
                            <Route path="register" element={<Register />} />
                            <Route path="resetpassword" element={<ResetPassword />} />
                            <Route path="homepage" element={<Homepage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </React.StrictMode>
    );
}


{/* <Route element={<PublicRoute />}>
    <Route element={<Layout />}>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="resetpassword" element={<ResetPassword />} />
    </Route>
</Route> */}





// <Route element={<Layout />}>
//     <Route path="/" element={<Login />} />
//     <Route path="register" element={<Register />} />
//     <Route path="resetpassword" element={<ResetPassword />}
//     <Route element={<ProtectedRoute />}>
//          <Route path="homepage" element={<Homepage />} />
//          + ajouter ici les routes nécéssitant une authentification
// </Route>
