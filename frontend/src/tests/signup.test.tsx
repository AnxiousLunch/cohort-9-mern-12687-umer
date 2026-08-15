import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/SignupPage";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import type { ReactElement } from "react";

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

const error = new axios.AxiosError(
  "Request failed",
  "ERR_BAD_REQUEST",
  undefined,
  undefined,
  {
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config: {},
    data: {
      msg: "Invalid Credentials!",
    },
  }
);

const mockNavigate = vi.fn();
const mockAuth = vi.mocked(useAuth);
const signupMock = vi.fn().mockResolvedValue(undefined);

function renderPage(): ReturnType<typeof render> {
    return render(<MemoryRouter>
        <SignupPage />
    </MemoryRouter>);
}

describe('SignupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // default: not loading, signup resolves immediately
        signupMock.mockResolvedValue(undefined);
        mockAuth.mockReturnValue({
        signup: signupMock,
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
        try {
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

        } catch ( err ) {
            console.log("Failed to type: ", err);
            throw err;
        }

    });

    it('allows a signup for valid user', async () => {
        try {
            const user = userEvent.setup();
            renderPage();
            
    
            const usernameInput = screen.getByPlaceholderText('Username');
            const emailInput = screen.getByPlaceholderText("Email");
            const passwordInput = screen.getByPlaceholderText("Password");
    
            
            await user.type(usernameInput, "testuserabc");
            await user.type(emailInput, "testmail@gmail.com");
            await user.type(passwordInput, "1234567890");
    
            await user.click(await screen.getByRole("button", {name: "Create account"}))
    
            expect(signupMock).toHaveBeenCalledWith(
                'testuserabc',
                'testmail@gmail.com',
                '1234567890'
            );
    
            expect(mockNavigate).toHaveBeenCalledWith(
                "/dashboard",
                { replace: true }
            );
        } catch ( err ) {
            console.log("Faild to signup: ", err);
            throw err;
        }
    });

    it('rejects signup for an invalid user', async () => {
        try {
            const user = userEvent.setup();
    
            renderPage();
    
            const usernameInput = screen.getByPlaceholderText('Username');
            const emailInput = screen.getByPlaceholderText("Email");
            const passwordInput = screen.getByPlaceholderText("Password");
    
            const signupMock = vi.fn().mockRejectedValue(error);
            mockAuth.mockReturnValue({ signup: signupMock, isLoading: false });
    
            await user.type(usernameInput, "umer.safee");
            await user.type(emailInput, "umersafee@gmail.com");
            await user.type(passwordInput, "1234567890");
    
            await user.click(await screen.getByRole("button", {name: "Create account"}));
            expect(await screen.findByText('Invalid Credentials!')).toBeInTheDocument();

        } catch ( err ) {
            console.log("Did not reject invalid user: ", err);
            throw err;
        }
    });
    
    


});