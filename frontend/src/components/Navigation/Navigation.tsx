import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function Navigation() {
    const { t } = useTranslation("Navigation");
    const navigate = useNavigate();

    return (
        <nav
            data-testid="navigation-bar"
            className="grid grid-cols-5 gap-1 m-2 mt-10 mb-5 w-[75%] mx-auto"
        >
            <button
                type="button"
                aria-label="homepage-button"
                className="w-[75%] mx-auto text-xl font-semibold hover:cursor-pointer underline hover:text-white transition-all duration-300"
                onClick={() => navigate("/homepage")}
            >
                {t("homePage")}
            </button>

            <button
                type="button"
                aria-label="market-button"
                className="w-[75%] mx-auto text-xl font-semibold hover:cursor-pointer underline hover:text-white transition-all duration-300"
                onClick={() => navigate("/marketplace")}
            >
                {t("marketplace")}
            </button>

            <button
                type="button"
                aria-label="listings-button"
                className="w-[75%] mx-auto text-xl font-semibold hover:cursor-pointer underline hover:text-white transition-all duration-300"
                onClick={() => navigate("/bulletinsboard")}
            >
                {t("listings")}
            </button>

            <button
                type="button"
                aria-label="events-button"
                className="w-[75%] mx-auto text-xl font-semibold hover:cursor-pointer underline hover:text-white transition-all duration-300"
                onClick={() => navigate("/events")}
            >
                {t("events")}
            </button>

            <button
                type="button"
                aria-label="community-button"
                className="w-[75%] mx-auto text-xl font-semibold hover:cursor-pointer underline hover:text-white transition-all duration-300"
                onClick={() => navigate("/community")}
            >
                {t("community")}
            </button>
        </nav>
    );
}

export default Navigation;
