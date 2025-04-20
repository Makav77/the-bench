import { render, screen } from "@testing-library/react";
import Layout from "../../../components/Layout/Layout";
import '@testing-library/jest-dom';


jest.mock("../../../components/Header/Header", () => () => <header data-testid="header" />);
jest.mock("../../../components/Footer/Footer", () => () => <footer data-testid="footer" />);

describe("Layout", () => {
    test("Display header and footer", () => {
        render(<Layout />);

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
});
