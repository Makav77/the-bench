import Register from "../../../components/Register/Register";
import i18n from "../../i18nForTests";
import { I18nextProvider, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
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

describe("Password visibility", () => {
    test("Show/Hide password by clicking on button", () => {
        render(<Register />);

        const passwordInput = screen.getByLabelText(/password-field/i);
        const toggleIcon = screen.getByLabelText(/toggle-password-visibility/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute("type", "password");
    })

    test("Show/Hide password by pressing space bar", () => {
        render(<Register />);

        const passwordInput = screen.getByLabelText(/password-field/i);
        const toggleIcon = screen.getByLabelText(/toggle-password-visibility/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        toggleIcon.focus();
        expect(toggleIcon).toHaveFocus();

        fireEvent.keyUp(toggleIcon, {
            key: 'Space',
            code: 'Space'
        });
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.keyUp(toggleIcon, {
            key: 'Space',
            code: 'Space'
        });
        expect(passwordInput).toHaveAttribute("type", "password");
    })
})

describe("Redirection links", () => {
    test("Redirection to the login page", () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const cancelButton = screen.getByLabelText(/cancel-button/i);
        fireEvent.click(cancelButton);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    })
})

describe("Error handling", () => {
    test("Print error message when credentials are missing", () => {
        render(<Register />);

        const registerButton = screen.getByLabelText(/register-button/i);
        fireEvent.click(registerButton);

        expect(screen.getByText("All fields must be completed")).toBeInTheDocument();
    })

    test("Input fields show red border shake when credentials are missing", () => {
        render(<Register />);

        const firstnameInput = screen.getByLabelText(/firstname-field/i);
        const lastnameInput = screen.getByLabelText(/lastname-field/i);
        const emailInput = screen.getByLabelText(/email-field/i);
        const passwordInput = screen.getByLabelText(/password-field/i);
        const dateOfBirthInput = screen.getByLabelText(/dateOfBirth-field/i);
        const sendButton = screen.getByLabelText(/register-button/i);

        fireEvent.click(sendButton);

        expect(firstnameInput).toHaveClass("border-red-500 shake");
        expect(lastnameInput).toHaveClass("border-red-500 shake");
        expect(emailInput).toHaveClass("border-red-500 shake");
        expect(passwordInput).toHaveClass("border-red-500 shake");
        expect(dateOfBirthInput).toHaveClass("border-red-500 shake");
    })
})

// describe("After submission", () => {
//     test("Reset form fields after submission", () => {
//         render(<Register />);

//         const firstnameInput = screen.getByLabelText(/firstname-field/i);
//         const lastnameInput = screen.getByLabelText(/lastname-field/i);
//         const emailInput = screen.getByLabelText(/email-field/i);
//         const passwordInput = screen.getByLabelText(/password-field/i);
//         const dateOfBirthInput = screen.getByLabelText(/dateOfBirth-field/i);
//         const sendButton = screen.getByLabelText(/register-button/i);

//         fireEvent.change(firstnameInput, {
//             target: {
//                 value: "John"
//             }
//         });

//         fireEvent.change(lastnameInput, {
//             target: {
//                 value: "Doe"
//             }
//         });

//         fireEvent.change(emailInput, {
//             target: {
//                 value: "test@example.com"
//             }
//         });

//         fireEvent.change(passwordInput, {
//             target: {
//                 value: "password123"
//             }
//         });

//         fireEvent.change(dateOfBirthInput, {
//             target: {
//                 value: "2000-01-01"
//             }
//         });

//         fireEvent.click(sendButton);

//         expect(firstnameInput).toHaveValue("");
//         expect(lastnameInput).toHaveValue("");
//         expect(emailInput).toHaveValue("");
//         expect(passwordInput).toHaveValue("");
//         expect(dateOfBirthInput).toHaveValue("");
//     })
// })

describe("Translation", () => {
    test("Switch language", async () => {
        await i18n.changeLanguage("fr");
        render(
            <I18nextProvider i18n={i18n}>
                <Register />
            </I18nextProvider>
        );

        expect(screen.getByText("S'INSCRIRE")).toBeInTheDocument();
    })
})
