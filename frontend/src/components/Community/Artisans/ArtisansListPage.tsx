import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function ArtisansListPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Community/ArtisansListPage");

    const CATEGORIES = [
        t("plumber"),
        t("electrician"),
        t("carpenter"),
        t("painter"),
        t("mason"),
        t("gardener"),
        t("heatingEngineer"),
        t("tiler"),
        t("locksmith"),
        t("glazier"),
    ];

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full max-sm:p-2">
            <button
                type="button"
                onClick={() => navigate("/community")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5 max-sm:w-full max-sm:text-base max-sm:py-3"
            >
                {t("back")}
            </button>
    
            <h1 className="text-3xl font-bold mb-4 max-sm:text-2xl">
                {t("artisans")}
            </h1>

            <ul className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-3 text-center">
                {CATEGORIES.map((c) => (
                    <li
                        key={c}
                        onClick={() => navigate(`/artisans/${c}`)}
                        className="p-4 rounded-2xl cursor-pointer hover:shadow transition bg-white hover:bg-gray-100 max-sm:text-lg max-sm:p-5"
                    >
                        <strong className="capitalize">{c}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArtisansListPage;
