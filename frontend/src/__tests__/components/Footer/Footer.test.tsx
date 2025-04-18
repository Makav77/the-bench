import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../../../components/Footer/Footer";

describe("Signature", () => {
    test("Footer signature is present", () => {
        render(<Footer />);
        expect(screen.getByText("The Bench © 2025")).toBeInTheDocument();
    })
})
