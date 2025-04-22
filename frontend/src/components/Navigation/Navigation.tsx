import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function Navigation() {
    const { t } = useTranslation("Navigation");
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const buttons = (
        <>
            <button
                type="button"
                aria-label="homepage-button"
                className="bg-white border-1 cursor-pointer rounded-3xl h-12 sm:h-8 sm:hover:bg-red-200 active:bg-green-500"
                onClick={() => navigate("/homepage")}
            >
                <span className="block sm:hidden text-2xl">🏠</span>
                <span className="hidden sm:block">{t("homePage")}</span>
            </button>

            <button
                type="button"
                aria-label="market-button"
                className="bg-white border-1 cursor-pointer rounded-3xl h-12 sm:h-8 sm:hover:bg-red-200 active:bg-green-500"
                onClick={() => navigate("/marketplace")}
            >
                <span className="block sm:hidden text-2xl">🛒</span>
                <span className="hidden sm:block">{t("marketplace")}</span>
            </button>

            <button
                type="button"
                aria-label="listings-button"
                className="bg-white border-1 cursor-pointer rounded-3xl h-12 sm:h-8 sm:hover:bg-red-200 active:bg-green-500"
                onClick={() => navigate("/listings")}
            >
                <span className="block sm:hidden text-2xl">📢</span>
                <span className="hidden sm:block">{t("listings")}</span>
            </button>

            <button
                type="button"
                aria-label="events-button"
                className="bg-white border-1 cursor-pointer rounded-3xl h-12 sm:h-8 sm:hover:bg-red-200 active:bg-green-500"
                onClick={() => navigate("/events")}
            >
                <span className="block sm:hidden text-2xl">🎊</span>
                <span className="hidden sm:block">{t("events")}</span>
            </button>

            <button
                type="button"
                aria-label="community-button"
                className="bg-white border-1 cursor-pointer rounded-3xl h-12 sm:h-8 sm:hover:bg-red-200 active:bg-green-500"
                onClick={() => navigate("/community")}
            >
                <span className="block sm:hidden text-2xl">🤝</span>
                <span className="hidden sm:block">{t("community")}</span>
            </button>
        </>
    );

    return (
        <div
            data-testid="navigation-bar"
            className="w-full sm:w-[99%] mx-auto mt-5"
        >
            <div className="flex justify-start sm:hidden pr-4">
                <button
                    type="button"
                    aria-label="toggle-navigation"
                    className="bg-white text-xl border rounded-3xl ml-2 p-1 mb-2"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    MENU ☰
                </button>
            </div>

            {menuOpen && (
                <div className="grid grid-rows-5 gap-1 m-2 sm:hidden">
                    {buttons}
                </div>
            )}

            <div className="hidden sm:grid sm:grid-cols-5 gap-1 mb-3">
                {buttons}
            </div>
        </div>
    );
}

export default Navigation;
