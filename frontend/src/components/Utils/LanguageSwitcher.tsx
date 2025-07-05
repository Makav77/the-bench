import "../../i18n";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { language: "en", label: "English" },
        { language: "fr", label: "Français" },
    ];

    const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lng = e.target.value;
        i18n.changeLanguage(lng);
        localStorage.setItem("i18nextLng", lng);
    };

    return (
        <div className="flex gap-3 mt-2 items-center">
            <label className="font-semibold">
                🌍 Language
            </label>
            <select
                id="lang-select"
                value={i18n.language}
                onChange={changeLanguage}
                className="border px-3 py-1 rounded-xl cursor-pointer"
            >
                {languages.map((lang) => (
                    <option key={lang.language} value={lang.language}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default LanguageSwitcher;
