import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function Navigation() {
    const { t } = useTranslation("Navigation");
    const navigate = useNavigate();

    return (
        <div
            data-testid="navigation-bar"
            className="grid grid-cols-5 gap-1 m-2 mt-5"
        >
            <button
                type="button"
                aria-label="homepage-button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
                onClick={() => navigate("/homepage")}
            >
                {t("homePage")}
            </button>

            <button
                type="button"
                aria-label="market-button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
                onClick={() => navigate("/marketplace")}
            >
                {t("marketplace")}
            </button>

            <button
                type="button"
                aria-label="listings-button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
                onClick={() => navigate("/listings")}
            >
                {t("listings")}
            </button>

            <button
                type="button"
                aria-label="events-button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
                onClick={() => navigate("/events")}
            >
                {t("events")}
            </button>

            <button
                type="button"
                aria-label="community-button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
                onClick={() => navigate("/community")}
            >
                {t("community")}
            </button>
        </div>
    );
}

export default Navigation;
