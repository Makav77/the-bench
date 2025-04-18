import { render, screen } from "@testing-library/react";
import Header from "../../components/Header/Header";
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Header component", () => {
    test("renders logo, title, buttons and navigation", () => {
        render(<Header />);

        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        expect(screen.getByText("The Bench")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();

        const logo = screen.getByAltText("logo");
        expect(logo).toBeInTheDocument();

        expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
    });
});
