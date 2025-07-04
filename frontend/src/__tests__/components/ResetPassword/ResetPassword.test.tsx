
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../../../components/ResetPassword/ResetPassword";
import i18n from "../../i18nForTests";
import { I18nextProvider, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { act } from "react";

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
                loadPath: "/locales/{{lng}}/ResetPassword.json",
            },
            react: {
                useSuspense: false,
            },
        })
})

describe("Email form", () => {
    test("The field is present in the document", () => {
        render(<ResetPassword />);
        expect(screen.getByLabelText(/email-field/i)).toBeInTheDocument();
    })

    test("The field is filling in correctly", () => {
        render(<ResetPassword />);

        const emailInput = screen.getByLabelText(/email-field/i);

        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com"
            }
        });

        expect(emailInput).toHaveValue("test@example.com");
    })
})

describe("Redirection links", () => {
    test("Cancel button", () => {
        render(
            <MemoryRouter>
                <ResetPassword />
            </MemoryRouter>
        );

        const cancelLink = screen.getByLabelText(/cancel-button/i);
        fireEvent.click(cancelLink);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    })

    test("Send button", () => {
        render(
            <MemoryRouter>
                <ResetPassword />
            </MemoryRouter>
        );

        const sendLink = screen.getByLabelText(/send-button/i);
        fireEvent.click(sendLink);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    })
})

describe("Error handling", () => {
    test("Print error message if field is empty", async () => {
        render(
            <I18nextProvider i18n={i18n}>
                <ResetPassword />
            </I18nextProvider>
        );

        const sendButton = screen.getByLabelText(/send-button/i);
        fireEvent.click(sendButton);

        expect(screen.getByText("Error: missing mail")).toBeInTheDocument();
    })

    test("Field show red borders and shake when empty on submit", () => {
        render(<ResetPassword />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const sendButton = screen.getByLabelText(/send-button/i);

        fireEvent.click(sendButton);

        expect(emailInput).toHaveClass("border-red-500 shake");
    })
})

describe("After submission", () => {
    test("Clear mailState and mailAddress", async () => {
        render(<ResetPassword />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const sendButton = screen.getByLabelText(/send-button/i);
    
        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com",
            },
        });

        fireEvent.click(sendButton);

        await waitFor(() =>
            expect(
                screen.getByText(/You will receive a link to create a new password./i)
            ).toBeInTheDocument()
        );

        expect(screen.queryByLabelText(/email-field/i)).not.toBeInTheDocument();
    });

    test("Redirect to login page", async () => {
        jest.useFakeTimers();

        render(<ResetPassword />);
        const emailInput = screen.getByLabelText(/email-field/i);
        const sendButton = screen.getByLabelText(/send-button/i);

        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com"
            },
        });

        fireEvent.click(sendButton);

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(mockNavigate).toHaveBeenCalledWith("/");
        jest.useRealTimers();
    })
})

describe("Translation", () => {
    test("Switch language", async () => {
        await i18n.changeLanguage("fr");
        render(
            <I18nextProvider i18n={i18n}>
                <ResetPassword />
            </I18nextProvider>
        );

        expect(screen.getByText("Mot de passe oublié ?")).toBeInTheDocument();
    })
})
