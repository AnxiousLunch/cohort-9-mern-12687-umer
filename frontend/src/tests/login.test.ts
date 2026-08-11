import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../context/AuthContext';

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockAuth = vi.mocked(useAuth);

describe("LoginPage", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockReturnValue({
            login: vi.fn().mockResolveValue(undefined),
            isLoading: false,
        } as ReturnType<typeof useAuth>);

    });


    function renderPage() {
        return render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )
    }

    // verify successful routing happens
    // test render for all login components
    // test input fields for typing
    // test funciton call with valid and invalid user
    // display error message 
    // check for invalid users, empty users, invalid type input
    // check navigate to dashboard on successfull login
    // ?? 

});