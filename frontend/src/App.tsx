import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import { PublicRoute } from "./components/Utils/PublicRoute";
import ProtectedRoute from "./components/Login/ProtectedRoute";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword";

import Homepage from "./components/Homepage/Homepage";

import EventsPage from "./components/Events/EventsPage";
import EventDetailPage from "./components/Events/EventDetailPage";
import CreateEventPage from "./components/Events/CreateEventPage";
import EditEventPage from "./components/Events/EditEventPage";

import BulletinsBoardPage from "./components/Posts/BulletinsBoardPage";
import PostDetailPage from "./components/Posts/PostDetailPage";
import CreatePostPage from "./components/Posts/CreatePostPage";
import EditPostPage from "./components/Posts/EditPostPage";

import MarketPage from "./components/Market/MarketPage";
import CreateItemPage from "./components/Market/CreateItemPage";
import EditItemPage from "./components/Market/EditItemPage";
import ItemDetailsPage from "./components/Market/ItemDetailsPage";

import FlashPostDetailPage from "./components/FlashPosts/FlashPostDetailPage";
import CreateFlashPostForm from "./components/FlashPosts/CreateFlashPostForm";
import EditFlashPostPage from "./components/FlashPosts/EditFlashPostForm";

import CommunityPage from "./components/Community/CommunityPage";
import GalleryPage from "./components/Gallery/GalleryPage";
import CreateGalleryItemPage from "./components/Gallery/CreateGalleryImagePage";
import GalleryItemDetailPage from "./components/Gallery/GalleryItemDetailPage";

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
                            <Route path="bulletinsboard" element={<BulletinsBoardPage />} />
                            <Route path="posts/:id" element={<PostDetailPage />} />
                            <Route path="posts/create" element={<CreatePostPage />} />
                            <Route path="posts/:id/edit" element={<EditPostPage />} />
                            <Route path="flashposts/:id" element={<FlashPostDetailPage />} />
                            <Route path="flashposts/create" element={<CreateFlashPostForm />} />
                            <Route path="flashposts/:id/edit" element={<EditFlashPostPage />} />
                            <Route path="marketplace" element={<MarketPage />} />
                            <Route path="market/create" element={<CreateItemPage />} />
                            <Route path="market/:id" element={<ItemDetailsPage />} />
                            <Route path="market/:id/edit" element={<EditItemPage />} />
                            <Route path="community" element={<CommunityPage />} />
                            <Route path="gallery" element={<GalleryPage />} />
                            <Route path="gallery/create" element={<CreateGalleryItemPage />} />
                            <Route path="gallery/:id" element={<GalleryItemDetailPage />} />
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
