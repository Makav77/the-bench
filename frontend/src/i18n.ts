import i18n from "i18next";
import Backend from "i18next-http-backend";
// import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from "react-i18next";

i18n.use(Backend)
    .use(initReactI18next)
    // .use(LanguageDetector)
    .init({
        lng: "en",
        fallbackLng: "en",
        debug: true,
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: { escapeValue: false },
});

export default i18n;
