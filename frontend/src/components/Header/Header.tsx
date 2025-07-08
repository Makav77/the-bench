import { useTranslation } from "react-i18next";
import Navigation from "../Navigation/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/authService";

function Header() {
    const { t } = useTranslation("Header/Header");
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            navigate("/");
        } catch(error) {
            console.error("Logout error : " + error);
        }
    };

    return (
        <div data-testid = "header" className="w-[100%] bg-[#00c6ff]">
            <div className="grid grid-cols-3 h-10 mb-8 mx-auto w-[75%]">
                <div className="flex items-center">
                    <img
                        src="assets/bench-logo.png"
                        alt="logo"
                        className="h-10 cursor-pointer"
                        onClick={() => navigate("/homepage")}
                    />

                    {isAuthenticated && user?.irisName && (
                        <span className="ml-8 px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-sm" title="Votre quartier">
                            {t("neighborhood")} : {user.irisName}
                        </span>
                    )}
                </div>
                

                <div className="flex items-center justify-center">
                    <p className="text-4xl font-bold">The Bench</p>
                </div>

                <div className="flex items-center justify-end">
                    { isAuthenticated && user ? (
                        <div className="flex items-center">
                            <span className="mr-4">
                                {t("hello", { firstname: user.firstname })}
                            </span>
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
                                aria-label="logout-button"
                                className="border-1 text-[#488ACF] text-1xl font-bold p-1 m-1 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-[#488ACF]"
                                onClick={handleLogout}
                            >
                                {t("logout")}
                            </button>

                            { user && (user.role === "admin" || user.role === "moderator") && (
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
                </div>
            </div>
            { isAuthenticated && user && <Navigation /> }
            <div className="border-b-2" />
        </div>
    );
}

export default Header;
