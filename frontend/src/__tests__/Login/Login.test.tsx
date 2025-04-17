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
                value: "test@example.com"
            }
        });
        fireEvent.change(passwordInput, {
            target: {
                value: "password123"
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

        fireEvent.keyUp(toggleButtonVisibility, {
            key: 'Space',
            code: 'Space'
        });
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.keyUp(toggleButtonVisibility, {
            key: 'Space',
            code: 'Space'
        });
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

describe("Error handling", () => {
    test("Print error message if email and password fields are empty", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        fireEvent.click(loginButton);

        expect(screen.getByText(/missingCredentials/i)).toBeInTheDocument();
    })

    test("Print error message if email field is empty", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.change(passwordInput, {
            target: {
                value: "password123"
            }
        });

        expect(emailInput).toHaveValue("");

        fireEvent.click(loginButton);
        expect(screen.getByText(/missingCredentials/i)).toBeInTheDocument();
    })

    test("Print error message if password field is empty", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com"
            }
        });

        expect(passwordInput).toHaveValue("");

        fireEvent.click(loginButton);
        expect(screen.getByText(/missingCredentials/i)).toBeInTheDocument();
    })

    test("Fields show red borders and shake when empty on submit", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.click(loginButton);

        expect(emailInput).toHaveClass("border-red-500 shake");
        expect(passwordInput).toHaveClass("border-red-500 shake");
    })

    test("Input field show red borders and shake when empty on submit", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.change(passwordInput, {
            target: {
                value: "password123"
            }
        });

        fireEvent.click(loginButton);
        expect(emailInput).toHaveClass("border-red-500 shake");
    })

    test("Password field show red borders and shake when empty on submit", () => {
        render(<Login />);

        const loginButton = screen.getByLabelText(/login-button/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);

        fireEvent.change(emailInput, {
            target: {
                value: "test@example.com"
            }
        });

        fireEvent.click(loginButton);
        expect(passwordInput).toHaveClass("border-red-500 shake");
    })
})

describe("Sending data", () => {
    test("Display a spinner on login button when loading", async () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const loginButton = screen.getByLabelText(/login-button/i);

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

        fireEvent.click(loginButton);

        expect(await screen.findByTestId("spinner")).toBeInTheDocument();
    })

    test("Login button is disabled when loading", () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const loginButton = screen.getByLabelText(/login-button/i);

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

        fireEvent.click(loginButton);

        expect(loginButton).toBeDisabled();
    })

    test("Login credentials are sent successfully", () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        render(<Login />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const loginButton = screen.getByLabelText(/login-button/i);

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

        fireEvent.click(loginButton);

        expect(consoleLogSpy).toHaveBeenCalledWith({
            email: "brice@test.com",
            password: "password123",
        });
    });
})

describe("After submission", () => {
    test("Reset form fields after submission", () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const loginButton = screen.getByLabelText(/login-button/i);

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

        fireEvent.click(loginButton);

        expect(emailInput).toHaveValue("");
        expect(passwordInput).toHaveValue("");
    })
})
