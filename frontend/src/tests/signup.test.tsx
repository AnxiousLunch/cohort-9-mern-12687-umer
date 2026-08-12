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

});