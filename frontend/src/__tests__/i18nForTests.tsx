import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fs from "node:fs";
import path from "node:path";

const LoginPathEN = path.resolve(__dirname, "../../public/locales/en/Login.json");
const NavigationPathEN = path.resolve(__dirname, "../../public/locales/en/Navigation.json");
const LoginPathFR = path.resolve(__dirname, "../../public/locales/fr/Login.json");
const NavigationPathFR = path.resolve(__dirname, "../../public/locales/fr/Navigation.json");
const LoginEN = JSON.parse(fs.readFileSync(LoginPathEN, "utf-8"));
const NavigationEN = JSON.parse(fs.readFileSync(NavigationPathEN, "utf-8"));
const LoginFR = JSON.parse(fs.readFileSync(LoginPathFR, "utf-8"));
const NavigationFR = JSON.parse(fs.readFileSync(NavigationPathFR, "utf-8"));

i18n
    .use(initReactI18next)
    .init({
        lng: "en",
        fallbackLng: "en",
        debug: false,
        resources: {
            en: { Login: LoginEN, Navigation: NavigationEN },
            fr: { Login: LoginFR, Navigation: NavigationFR },
        },
        ns: ["Login", "Navigation"],
        defaultNS: "Login",
        interpolation: { escapeValue: false },
    });

export default i18n;
