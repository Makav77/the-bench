import { fireEvent, render, screen } from "@testing-library/react";
import Header from "../../../components/Header/Header";
import '@testing-library/jest-dom';
import i18n from "../../i18nForTests";
import { I18nextProvider, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

beforeAll(() => {
    i18n
        .use(initReactI18next)
        .use(HttpBackend)
        .init({
            lng: "en",
            backend: {
                loadPath: "/locales/{{lng}}/Register.json",
            },
            react: {
                useSuspense: false,
            },
        })
})

describe("Header component", () => {
    test("renders logo, title and navigation", () => {
        render(<Header />);

        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        expect(screen.getByText("The Bench")).toBeInTheDocument();

        const logo = screen.getByAltText("logo");
        expect(logo).toBeInTheDocument();

        expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
    })

    test("render logout redirection", () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        const logoutButon = screen.getByLabelText("logout-button");
        fireEvent.click(logoutButon);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    })
});

describe("Translation", () => {
    test("Switch Language", async () => {
        await i18n.changeLanguage("fr");
        render(
            <I18nextProvider i18n={i18n}>
                <Header />
            </I18nextProvider>
        );

        expect(screen.getByLabelText("profile-button")).toHaveTextContent("Profil");
        expect(screen.getByLabelText("logout-button")).toHaveTextContent("Déconnexion");
    })
})
