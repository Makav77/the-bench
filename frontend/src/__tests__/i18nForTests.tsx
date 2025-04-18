import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fs from "node:fs";
import path from "node:path";

const LoginPathEN = path.resolve(__dirname, "../../public/locales/en/Login.json");
const NavigationPathEN = path.resolve(__dirname, "../../public/locales/en/Navigation.json");
const ResetPasswordPathEN = path.resolve(__dirname, "../../public/locales/en/ResetPassword.json");
const RegisterPathEN = path.resolve(__dirname, "../../public/locales/en/Register.json");
const HeaderPathEN = path.resolve(__dirname, "../../public/locales/en/Header.json");

const LoginPathFR = path.resolve(__dirname, "../../public/locales/fr/Login.json");
const NavigationPathFR = path.resolve(__dirname, "../../public/locales/fr/Navigation.json");
const ResetPasswordPathFR = path.resolve(__dirname, "../../public/locales/fr/ResetPassword.json");
const RegisterPathFR = path.resolve(__dirname, "../../public/locales/fr/Register.json");
const HeaderPathFR = path.resolve(__dirname, "../../public/locales/fr/Header.json");

const LoginEN = JSON.parse(fs.readFileSync(LoginPathEN, "utf-8"));
const NavigationEN = JSON.parse(fs.readFileSync(NavigationPathEN, "utf-8"));
const ResetPasswordEN = JSON.parse(fs.readFileSync(ResetPasswordPathEN, "utf-8"));
const RegisterEN = JSON.parse(fs.readFileSync(RegisterPathEN, "utf-8"));
const HeaderEN = JSON.parse(fs.readFileSync(HeaderPathEN, "utf-8"));

const LoginFR = JSON.parse(fs.readFileSync(LoginPathFR, "utf-8"));
const NavigationFR = JSON.parse(fs.readFileSync(NavigationPathFR, "utf-8"));
const ResetPasswordFR = JSON.parse(fs.readFileSync(ResetPasswordPathFR, "utf-8"));
const RegisterFR = JSON.parse(fs.readFileSync(RegisterPathFR, "utf-8"));
const HeaderFR = JSON.parse(fs.readFileSync(HeaderPathFR, "utf-8"));

i18n
    .use(initReactI18next)
    .init({
        lng: "en",
        fallbackLng: "en",
        debug: false,
        resources: {
            en: { Login: LoginEN, Navigation: NavigationEN, ResetPassword: ResetPasswordEN, Register: RegisterEN, Header: HeaderEN },
            fr: { Login: LoginFR, Navigation: NavigationFR, ResetPassword: ResetPasswordFR, Register: RegisterFR, Header: HeaderFR },
        },
        ns: ["Login", "Navigation", "ResetPassword", "Register", "Header"],
        defaultNS: "Login",
        interpolation: { escapeValue: false },
    });

export default i18n;
