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
import GalleryPage from "./components/Community/Gallery/GalleryPage";
import CreateGalleryItemPage from "./components/Community/Gallery/CreateGalleryImagePage";
import GalleryItemDetailPage from "./components/Community/Gallery/GalleryItemDetailPage";

import PollsPage from "./components/Community/Polls/PollsPage";
import PollDetailPage from "./components/Community/Polls/PollDetailPage";
import CreatePollPage from "./components/Community/Polls/CreatePollPage";

import ArtisansListPage from "./components/Community/Artisans/ArtisansListPage";
import ArtisansByTypePage from "./components/Community/Artisans/ArtisansByTypePage";

import CalendarPage from "./components/Community/Calendar/CalendarPage";

import EditChallengePage from "./components/Community/Challenges/EditChallengePage";
import ValidateCompletionPage from "./components/Community/Challenges/ValidateCompletion";

import { ToastContainer } from "react-toastify";
import ChallengesPage from "./components/Community/Challenges/ChallengesPage";
import CreateChallengePage from "./components/Community/Challenges/CreateChallengePage";
import ChallengeDetailPage from "./components/Community/Challenges/ChallengeDetailsPage";

import UserProfilePage from "./components/Profile/UserProfilePage";

import DashboardPage from "./components/Dashboard/Dashboard";

import NewsPage from "./components/Community/News/NewsPage";
import NewsDetailPage from "./components/Community/News/NewsDetailPage";
import CreateNews from "./components/Community/News/CreateNews";
import EditNews from "./components/Community/News/EditNewsForm";

import TermsOfUse from "./components/Footer/TermsOfUse";

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
                            <Route path="polls" element={<PollsPage />} />
                            <Route path="polls/create" element={<CreatePollPage />} />
                            <Route path="polls/:id" element={<PollDetailPage />} />
                            <Route path="artisans" element={<ArtisansListPage />} />
                            <Route path="artisans/:job" element={<ArtisansByTypePage />} />
                            <Route path="calendar" element={<CalendarPage />} />
                            <Route path="challenges" element={<ChallengesPage />} />
                            <Route path="challenges/create" element={<CreateChallengePage />} />
                            <Route path="challenges/:id" element={<ChallengeDetailPage />} />
                            <Route path="challenges/:id/edit" element={<EditChallengePage />} />
                            <Route path="challenges/:id/validate" element={<ValidateCompletionPage />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="/profile/:id" element={<UserProfilePage />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/news/:id" element={<NewsDetailPage />} />
                            <Route path="/news/create" element={<CreateNews />} />
                            <Route path="/news/:id/edit" element={<EditNews />} />
                            <Route path="/termsofuse" element={<TermsOfUse />} />
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
