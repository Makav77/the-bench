import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import i18n from "../../i18nForTests";
import Navigation from "../../../components/Navigation/Navigation";
import { I18nextProvider } from "react-i18next";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Buttons", () => {
    test("All buttons are present", () => {
        render(<Navigation />);

        expect(screen.getByLabelText("homepage-button")).toBeInTheDocument();
        expect(screen.getByLabelText("market-button")).toBeInTheDocument();
        expect(screen.getByLabelText("listings-button")).toBeInTheDocument();
        expect(screen.getByLabelText("events-button")).toBeInTheDocument();
        expect(screen.getByLabelText("community-button")).toBeInTheDocument();
    })
})

describe("Navigation link", () => {
    beforeEach(() => render(<Navigation />));
    afterEach(() => jest.clearAllMocks());

    test("Navigation to homepage", () => {
        const homepageButton = screen.getByLabelText("homepage-button");
        fireEvent.click(homepageButton);

        expect(mockNavigate).toHaveBeenCalledWith("/homepage");
    })

    test("Navigation to marketplace", () => {
        const marketplaceButton = screen.getByLabelText("market-button");
        fireEvent.click(marketplaceButton);

        expect(mockNavigate).toHaveBeenCalledWith("/marketplace");
    })

    test("Navigation to listings", () => {
        const listingsButton = screen.getByLabelText("listings-button");
        fireEvent.click(listingsButton);

        expect(mockNavigate).toHaveBeenCalledWith("/bulletinsboard");
    })

    test("Navigation to events", () => {
        const eventsButton = screen.getByLabelText("events-button");
        fireEvent.click(eventsButton);

        expect(mockNavigate).toHaveBeenCalledWith("/events");
    })

    test("Navigation to community", () => {
        const communityButton = screen.getByLabelText("community-button");
        fireEvent.click(communityButton);

        expect(mockNavigate).toHaveBeenCalledWith("/community");
    })
})

describe("Translation", () => {
    test("Switch language", async () => {
        await i18n.changeLanguage("fr");
        render(
            <I18nextProvider i18n={i18n}>
                <Navigation />
            </I18nextProvider>
        );

        expect(screen.getByLabelText("homepage-button")).toHaveTextContent("Page d'accueil");
        expect(screen.getByLabelText("market-button")).toHaveTextContent("Magasin");
        expect(screen.getByLabelText("listings-button")).toHaveTextContent("Annonces");
        expect(screen.getByLabelText("events-button")).toHaveTextContent("Évènements");
        expect(screen.getByLabelText("community-button")).toHaveTextContent("Communauté");
    })
})
