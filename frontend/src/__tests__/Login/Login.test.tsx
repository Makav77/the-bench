import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../components/Login/Login'

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

beforeAll(() => {
    i18n
        .use(initReactI18next)
        .use(HttpBackend)
        .init({
            lng: "en",
            backend: {
                loadPath: "/locales/{{lng}}/Login.json",
            },
            react: {
                useSuspense: false,
            },
        })
})


describe("Login forms", () => {
    test("The fields are present in the document", () => {
        render(<Login />);

        expect(screen.getByLabelText(/email-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/rememberMe-checkbox/i)).toBeInTheDocument();
    })

    test("The fields are filling in correctly", () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.change(emailInput, {
            target: {
                value: "brice@example.com"
            }
        });
        fireEvent.change(passwordInput, {
            target: {
                value: "motdepasse123"
            }
        });

        expect(emailInput).toHaveValue("brice@example.com");
        expect(passwordInput).toHaveValue("motdepasse123");
    })

    test("The \"remember me\" checkbox can be checked and unchecked", () => {
        render(<Login />);

        const checkbox = screen.getByLabelText(/rememberMe-checkbox/i);

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();

        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
    })
})

describe("Password visibility", () => {
    test("Show/Hide password by cliking on button", () => {
        render(<Login />)

        const passwordInput = screen.getByLabelText(/password-field/i);
        const toggleIcon = screen.getByLabelText(/toggle-password-visibility/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute("type", "password");
    })

    test("Show/Hide password by pressing enter", () => {
        render(<Login />)
    
        const toggleButtonVisibility = screen.getByLabelText(/toggle-password-visibility/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
    
        expect(passwordInput).toHaveAttribute("type", "password");
    
        toggleButtonVisibility.focus();
        expect(toggleButtonVisibility).toHaveFocus();
    
        fireEvent.keyUp(toggleButtonVisibility, { key: 'Space', code: 'Space' })
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.keyUp(toggleButtonVisibility, { key: 'Space', code: 'Space' })
        expect(passwordInput).toHaveAttribute("type", "password");
    })
})

describe("Redirection links", () => {
    test("Redirection to the reset password page", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const forgotPasswordLink = screen.getByLabelText(/forgot-password-link/i);
        expect(forgotPasswordLink).toHaveAttribute("href", "/resetpassword");
    })

    test("Redirection to the registration page", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const registerLink = screen.getByLabelText(/register-link/i);
        expect(registerLink).toHaveAttribute("href", "/register");
    })
})
