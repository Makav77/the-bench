import { useTranslation } from "react-i18next";
import Navigation from "../Navigation/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/authService";
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

function capitalize(str: string) {
    if (!str) {
        return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function Header() {
    const { t } = useTranslation("Header/Header");
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<{ id: string; firstname: string; lastname: string; }[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const handleLogout = async () => {
        await logoutUser();
        logout();
        navigate("/");
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await apiClient.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
                    setSearchResults(response.data);
                } catch {
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        };
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <div
            data-testid="header"
            className="w-[100%] bg-[#00c6ff]"
        >
            <div className="hidden max-sm:flex flex-col w-full px-2 py-2">
                <div className="flex justify-end items-center w-full mb-1">
                    {isAuthenticated && user?.irisName && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-xs whitespace-nowrap">
                            {t("neighborhood")} : {user.irisName}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 w-full">
                    <img
                        src="assets/bench-logo.png"
                        alt="logo"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => navigate("/homepage")}
                    />
                    <span className="text-4xl font-bold">The Bench</span>
                </div>

                {isAuthenticated && user && (
                    <span className="font-semibold mt-1 text-center text-xl">
                        {t("hello", { firstname: user.firstname })}
                    </span>
                )}

                <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {isAuthenticated && user && (
                        <>
                            <button
                                type="button"
                                aria-label="profile-button"
                                className="text-[#488ACF] bg-white text-lg font-bold px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                {t("profile")}
                            </button>

                            <button
                                type="button"
                                aria-label="message-button"
                                className="text-[#488ACF] bg-white text-lg font-bold px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={() => navigate("/chat")}
                            >
                                {t("messages")}
                            </button>

                            <button
                                type="button"
                                aria-label="logout-button"
                                className="text-[#488ACF] bg-white text-lg font-bold px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={handleLogout}
                            >
                                {t("logout")}
                            </button>

                            {user && (user.role === "admin" || user.role === "moderator") && (
                                <button
                                    type="button"
                                    aria-label="dashboard-button"
                                    className="text-[#488ACF] bg-white text-lg font-bold px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    {t("dashboard")}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {isAuthenticated && user && (
                    <div className="w-full mt-2 mb-1 px-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }, 100);
                                }}
                                className="w-full px-3 py-2 border rounded-2xl focus:outline-none focus:ring bg-gray-100 text-sm"
                                placeholder={t("searchPlaceholder")}
                            />

                            {searchQuery.length >= 2 && (
                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow max-h-40 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="px-2 py-1 text-gray-500 italic">{t("searching")}</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(resultUser => (
                                            <div
                                                key={resultUser.id}
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSearchResults([]);
                                                    navigate(`/profile/${resultUser.id}`);
                                                }}
                                                className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            >
                                                <span>
                                                    {capitalize(resultUser.firstname)} {capitalize(resultUser.lastname)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-2 py-1 text-gray-500 italic">{t("noUserFound")}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 h-10 mb-15 mx-auto w-[75%] max-sm:hidden">
                <div className="flex items-center">
                    <img
                        src="assets/bench-logo.png"
                        alt="logo"
                        className="h-10 cursor-pointer"
                        onClick={() => navigate("/homepage")}
                    />

                    {isAuthenticated && user?.irisName && (
                        <span className="ml-8 px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-sm">
                            {t("neighborhood")} : {user.irisName}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-center">
                    <p className="text-4xl font-bold">
                        The Bench
                    </p>
                </div>

                <div className="flex flex-col items-end justify-end">
                    {isAuthenticated && user ? (
                        <div className="flex items-center">
                            <span className="mr-4">{t("hello", { firstname: user.firstname })}</span>
                            <button
                                type="button"
                                aria-label="profile-button"
                                className="border-1 text-[#488ACF] text-1xl font-bold p-1 m-1 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                {t("profile")}
                            </button>

                            <button
                                type="button"
                                aria-label="message-button"
                                className="border-1 text-[#488ACF] text-1xl font-bold p-1 m-1 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={() => navigate("/chat")}
                            >
                                {t("messages")}
                            </button>

                            <button
                                type="button"
                                aria-label="logout-button"
                                className="border-1 text-[#488ACF] text-1xl font-bold p-1 m-1 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={handleLogout}
                            >
                                {t("logout")}
                            </button>

                            {user && (user.role === "admin" || user.role === "moderator") && (
                                <button
                                    type="button"
                                    className="border-1 text-[#488ACF] text-1xl font-bold p-1 m-1 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    {t("dashboard")}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            aria-label="login-button"
                            className="border-1 text-[#488ACF] text-1xl font-bold pt-1 pb-1 pr-3 pl-3 mr-4 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                            onClick={() => navigate("/")}
                        >
                            {t("login")}
                        </button>
                    )}

                    {isAuthenticated && user && (
                        <div className="mt-2 w-72">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        }, 100);
                                    }}
                                    className="w-full px-3 py-1 border rounded-2xl focus:outline-none focus:ring bg-gray-100"
                                    placeholder={t("searchPlaceholder")}
                                />

                                {searchQuery.length >= 2 && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow max-h-40 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="px-2 py-1 text-gray-500 italic">{t("searching")}</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(resultUser => (
                                                <div
                                                    key={resultUser.id}
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setSearchResults([]);
                                                        navigate(`/profile/${resultUser.id}`);
                                                    }}
                                                    className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <span>
                                                        {capitalize(resultUser.firstname)} {capitalize(resultUser.lastname)}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1 text-gray-500 italic">{t("noUserFound")}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isAuthenticated && user && <Navigation />}
            <div className="border-b-2" />
        </div>
    );
}

export default Header;
