import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/SignupPage";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => (
    {
        useAuth: vi.fn()
    }
));


afterEach(() => {
  cleanup();
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockNavigate = vi.fn();
const mockAuth = vi.mocked(useAuth);

function renderPage() {
    return render(<MemoryRouter>
        <SignupPage />
    </MemoryRouter>);
}

describe('SignupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // default: not loading, signup resolves immediately
        mockAuth.mockReturnValue({
        signup: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        });
    });

    it('renders signup page', () => {
        renderPage();
        expect(screen.getByRole("heading", {name: 'Create an account'})).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: 'Create account'})).toBeInTheDocument();
    });

    it('allows user to type', async () => {
        renderPage();
        const user = userEvent.setup();

        const usernameInput = screen.getByPlaceholderText('Username');
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");

        await user.type(usernameInput, "umersafee123");
        await user.type(emailInput, "testemail@test.com");
        await user.type(passwordInput, "1234567890");

        expect(usernameInput).toHaveValue("umersafee123");
        expect(emailInput).toHaveValue("testemail@test.com");
        expect(passwordInput).toHaveValue("1234567890");
    });

});