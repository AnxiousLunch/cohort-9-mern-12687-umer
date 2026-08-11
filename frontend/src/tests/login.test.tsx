import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../context/AuthContext';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));


// verify successful routing happens
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
const actual = await vi.importActual('react-router-dom');
return {
    ...actual,
    useNavigate: () => mockNavigate,
};
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

const mockAuth = vi.mocked(useAuth);

describe("LoginPage", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockReturnValue({
            login: vi.fn().mockResolvedValue(undefined),
            isLoading: false,
        } as ReturnType<typeof useAuth>);

    });



    // test render for all login components
    it('renders login form on the screen', () => {
        renderPage();
        expect(screen.getByRole('heading', {
        name: "Log in"
        })).toBeInTheDocument;

        expect(screen.getByPlaceholderText('Username or email'))
        .toBeInTheDocument();

        expect(screen.getByPlaceholderText('Password'))
        .toBeInTheDocument();

        expect(screen.getByRole('button', {name: 'Log in'}))
        .toBeInTheDocument();
    });

    // test input fields for typing
    it('allows the user to enter credentials', async () => {
        const user = userEvent.setup();
        renderPage();

        const identifierInput = screen.getByPlaceholderText('Username or email');
        const passwordInput = screen.getByPlaceholderText('Password');

        await user.type(identifierInput, 'umer.safee');
        await user.type(passwordInput, '1234567890');

        expect(identifierInput).toHaveValue('umer.safee');
        expect(passwordInput).toHaveValue('1234567890');
    });

    // test funciton call with valid and invalid user
    it('tesst login with entered credentials', async () => {
        const user = userEvent.setup();
        const loginMock = vi.fn().mockResolvedValue(undefined);
        mockAuth.mockReturnValue({ login: loginMock, isLoading: false });

        renderPage();

        await user.type(
        screen.getByPlaceholderText('Username or email'),
        'umer.safee'
        );
        await user.type(
        screen.getByPlaceholderText('Password'),
        '1234567890'
        );
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(loginMock).toHaveBeenCalledTimes(1);
        expect(loginMock).toHaveBeenCalledWith('umer.safee', '1234567890');
    });
    
    // display error message 
    it('displays error message on failed login', async () => {
        const user = userEvent.setup();
        const loginMock = vi.fn()
        .mockRejectedValue(new Error('Invalid credentials'));
        mockAuth.mockReturnValue({ login: loginMock, isLoading: false });

        renderPage();

        await user.type(
            screen.getByPlaceholderText('Username or email'),
            'umer'
        );
        await user.type(
            screen.getByPlaceholderText('Password'),
            'wrong'
        );
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(
        await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });

    // check for invalid users, empty users, invalid type input -> checked with dispaly error message
    // check navigate to dashboard on successfull login
    it('navigates to dashboard on successful login', async () => {
        const user = userEvent.setup();
        const loginMock = vi.fn().mockResolvedValue(undefined);
        mockAuth.mockReturnValue({ login: loginMock, isLoading: false });

        renderPage();

        await user.type(
        screen.getByPlaceholderText('Username or email'),'umer.safee');
        
        await user.type(screen.getByPlaceholderText('Password'),'1234567890');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
            replace: true
        });
        });
    });
    // Invalid password checks -> already checked with display error message

});