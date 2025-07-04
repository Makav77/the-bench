import "../../i18n";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-3 mt-2">
            <button
                className="cursor-pointer border px-3 rounded-xl"
                onClick={() => changeLanguage("en")}
            >
                English
            </button>

            <button
                className="cursor-pointer border px-3 rounded-xl"
                onClick={() => changeLanguage("fr")}
            >
                Français
            </button>
        </div>
    );
}

export default LanguageSwitcher;
