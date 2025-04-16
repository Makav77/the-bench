import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '../../components/Login/Login'

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from 'i18next-http-backend';

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
        });
});


describe('Login forms', () => {
    test('The fields are present in the document', () => {
        render(<Login />)

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/rememberMe/i)).toBeInTheDocument()
    })

    test('The fields are filling in correctly', () => {
        render(<Login />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)

        fireEvent.change(emailInput, { target: { value: 'brice@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'motdepasse123' } })

        expect(emailInput).toHaveValue('brice@example.com')
        expect(passwordInput).toHaveValue('motdepasse123')
    })

    test('The "remember me" checkbox can be checked and unchecked', () => {
        render(<Login />)

        const checkbox = screen.getByLabelText(/rememberMe/i)

        fireEvent.click(checkbox)
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox)
        expect(checkbox).not.toBeChecked()
    })
})
