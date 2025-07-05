import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const storedLng = localStorage.getItem("i18nextLng") || "en";

i18n.use(Backend)
    .use(initReactI18next)
    .init({
        lng: storedLng,
        fallbackLng: "en",
        debug: true,
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: { escapeValue: false },
});

export default i18n;
