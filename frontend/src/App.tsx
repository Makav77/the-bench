import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import { PublicRoute } from "./components/Utils/PublicRoute";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import Homepage from "./components/Homepage/Homepage";
import EventsPage from "./components/Events/EventsPage";
import EventDetailPage from "./components/Events/EventDetailPage";
import CreateEventPage from "./components/Events/CreateEventPage";
import EditEventPage from "./components/Events/EditEventPage";
import { ToastContainer } from "react-toastify";

export default function App() {
    return (
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
                            <Route path="events/:id/edit" element={<EditEventPage />} />
                        </Route>
                    </Route>
                </Routes>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    aria-label={undefined}
                />
            </BrowserRouter>
        </AuthProvider>
    )
}
