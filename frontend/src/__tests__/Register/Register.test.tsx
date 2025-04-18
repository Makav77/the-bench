import Register from "../../components/Register/Register";
import i18n from "../i18nForTests";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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

describe("Register forms", () => {
    test("The fields are present in the document", () => {
        render(<Register />);

        expect(screen.getByLabelText(/firstname-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/lastname-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/dateOfBirth-field/i)).toBeInTheDocument();
    })

    test("The fields are filling in correctly", () => {
        render(<Register />);

        const firstnameInput = screen.getByLabelText(/firstname-field/i);
        const lastnameInput = screen.getByLabelText(/lastname-field/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const dateOfBirthInput = screen.getByLabelText(/dateOfBirth-field/i);

        fireEvent.change(firstnameInput, {
            target: {
                value: "John"
            }
        });

        fireEvent.change(lastnameInput, {
            target: {
                value: "Doe"
            }
        });

        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com"
            }
        });

        fireEvent.change(passwordInput, {
            target: {
                value: "password123"
            }
        });

        fireEvent.change(dateOfBirthInput, {
            target: {
                value: "2000-01-01"
            }
        });

        expect(firstnameInput).toHaveValue("John");
        expect(lastnameInput).toHaveValue("Doe");
        expect(emailInput).toHaveValue("test@example.com");
        expect(passwordInput).toHaveValue("password123");
        expect(dateOfBirthInput).toHaveValue("2000-01-01");
    })
})