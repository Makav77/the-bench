import { useTranslation } from "react-i18next";

function Navigation() {
    const { t } = useTranslation("Navigation");
    return (
        <div className="grid grid-cols-5 gap-1 m-2 mt-5">
            <button
                type="button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
            >
                {t("homePage")}
            </button>

            <button
                type="button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
            >
                {t("marketplace")}
            </button>

            <button
                type="button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
            >
                {t("listings")}
            </button>

            <button
                type="button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
            >
                {t("events")}
            </button>

            <button
                type="button"
                className="bg-white border-1 cursor-pointer rounded-3xl"
            >
                {t("community")}
            </button>
        </div>
    );
}

export default Navigation;
