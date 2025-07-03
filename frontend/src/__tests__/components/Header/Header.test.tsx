import { fireEvent, render, screen } from "@testing-library/react";
import Header from "../../../components/Header/Header";
import '@testing-library/jest-dom';
import i18n from "../../i18nForTests";
import { I18nextProvider, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

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
    beforeEach(() => render(<Header />));

    test("renders logo, title and navigation", () => {
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        expect(screen.getByText("The Bench")).toBeInTheDocument();

        const logo = screen.getByAltText("logo");
        expect(logo).toBeInTheDocument();
    })

    test("render logout redirection", () => {
        const logoutButton = screen.getByLabelText("logout-button");
        fireEvent.click(logoutButton);

        expect(mockNavigate).toHaveBeenCalledWith("/");
        jest.clearAllMocks();
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

/*

// frontend/src/__tests__/components/Header/Header.test.tsx

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';

// 1) Mock de useNavigate() pour capter les navigations
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header component', () => {
  const renderHeader = (authValue: Partial<AuthContextType>) => {
    // Valeurs par défaut du contexte
    const defaultAuth: AuthContextType = {
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      fetchUser: jest.fn(),
    };
    return render(
      <AuthContext.Provider value={{ ...defaultAuth, ...authValue }}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test('affiche logo, titre et bouton login quand pas connecté', () => {
    renderHeader({ isAuthenticated: false, user: null });

    // on ne trouve pas logout ni profile
    expect(screen.queryByLabelText('logout-button')).toBeNull();
    expect(screen.queryByLabelText('profile-button')).toBeNull();

    // on trouve le bouton login
    expect(screen.getByLabelText('login-button')).toBeInTheDocument();

    // logo et titre toujours présents
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('The Bench')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('affiche greeting, profile et logout quand connecté', () => {
    // Simule un user connecté
    const fakeUser = { id: 'u1', firstname: 'Jean', lastname: 'Dupont' } as any;
    renderHeader({ isAuthenticated: true, user: fakeUser });

    // Greeting
    expect(screen.getByText('Bonjour Jean')).toBeInTheDocument();

    // Profile et logout
    expect(screen.getByLabelText('profile-button')).toBeInTheDocument();
    expect(screen.getByLabelText('logout-button')).toBeInTheDocument();

    // la navigation principale (<Navigation />) est affichée
    expect(screen.getByText('...')) // remplace '...' par un item de ton Navigation
  });

  test('logout redirige vers / et appelle logout du contexte', () => {
    const fakeUser = { id: 'u1', firstname: 'Jean', lastname: 'Dupont' } as any;
    const mockLogout = jest.fn();
    renderHeader({ isAuthenticated: true, user: fakeUser, logout: mockLogout });

    fireEvent.click(screen.getByLabelText('logout-button'));
    // on doit rediriger vers "/"
    expect(mockNavigate).toHaveBeenCalledWith('/');
    // on doit appeler logout() du contexte
    expect(mockLogout).toHaveBeenCalled();
  });
});

*/
