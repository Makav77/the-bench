import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Navigation() {
    const { t } = useTranslation("Navigation");
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav
            data-testid="navigation-bar"
            className="grid grid-cols-5 gap-1 m-2 mt-10 mb-5 w-[75%] mx-auto"
        >
            <button
                type="button"
                aria-label="homepage-button"
                className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 ${location.pathname.startsWith("/homepage") ? "text-white" : "hover:underline"}`}
                onClick={() => navigate("/homepage")}
            >
                {t("homePage")}
            </button>

            <button
                type="button"
                aria-label="market-button"
                className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 ${location.pathname.startsWith("/marketplace") || location.pathname.startsWith("/market") ? "text-white" : "hover:underline"}`}
                onClick={() => navigate("/marketplace")}
            >
                {t("marketplace")}
            </button>

            <button
                type="button"
                aria-label="listings-button"
                className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 ${location.pathname.startsWith("/bulletinsboard") || location.pathname.startsWith("/posts") || location.pathname.startsWith("/flashposts") ? "text-white" : "hover:underline"}`}
                onClick={() => navigate("/bulletinsboard")}
            >
                {t("listings")}
            </button>

            <button
                type="button"
                aria-label="events-button"
                className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 ${location.pathname.startsWith("/events") ? "text-white" : "hover:underline"}`}
                onClick={() => navigate("/events")}
            >
                {t("events")}
            </button>

            <button
                type="button"
                aria-label="community-button"
                className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 
                    ${location.pathname.startsWith("/community") ||
                    location.pathname.startsWith("/gallery") ||
                    location.pathname.startsWith("/polls") ||
                    location.pathname.startsWith("/challenges") ||
                    location.pathname.startsWith("/calendar") ||
                    location.pathname.startsWith("/artisans") ||
                    location.pathname.startsWith("/news")
                        ? "text-white" : "hover:underline"}`}
                onClick={() => navigate("/community")}
            >
                {t("community")}
            </button>
        </nav>
    );
}

export default Navigation;
