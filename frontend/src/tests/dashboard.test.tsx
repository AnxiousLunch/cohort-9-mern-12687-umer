import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../handlers/noteHandlers';


vi.mock("../context/AuthContext", () => (
    {
        useAuth: vi.fn()
    }
));


afterEach(() => {
  cleanup();
});


vi.mock("../handlers/noteHandlers", () => ({
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn()
}));

const mockAuth = vi.mocked(useAuth);
const mockGetNotes = vi.mocked(getNotes);
const mockCreateNote = vi.mocked(createNote);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

function renderPage() {
    return render(
        <Dashboard />
    );
}

describe('Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAuth.mockReturnValue({
            logout: vi.fn().mockResolvedValue(undefined),
        });


        mockGetNotes.mockResolvedValue([
            {id: 1, title: 'Note 1', content: 'Content', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
        ]);

        mockCreateNote.mockResolvedValue({id: 2, title: 'Note 2', content: "content 2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()});

        mockUpdateNote.mockResolvedValue({id: 1, title: 'Note 1', content: 'Content Now Updated!', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()});

        mockDeleteNote.mockResolvedValue(undefined);
    });

    it('renders UI', async () => {
        renderPage();

        expect(await screen.findByText('Note 1')).toBeInTheDocument();

        expect(await screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Note' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });

    it('Showes error message when loading notes fails', async () => {
        mockGetNotes.mockRejectedValue(new Error("Failed to load notes"));
        renderPage();
        expect(await screen.findByText("Failed to load notes")).toBeInTheDocument();
    });

    it('creates a new note and displays', async () => {
        mockGetNotes.mockResolvedValue([]);
        renderPage();
        const user = userEvent.setup();

        expect(screen.getByText('Nothing Selected')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Create Note' }));

        expect(await screen.findByDisplayValue('Note 2')).toBeInTheDocument();
    
        expect(screen.getByText('Note 2')).toBeInTheDocument();
    });

    it('deletes notes properly', async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByText('Note 1');
        await user.click(screen.getByRole("button", {name: 'Delete'}));

        await waitFor(() => {
            expect (mockDeleteNote).toHaveBeenCalledWith(1); // one here refers to id
        });

        expect(screen.queryByText("Note 1")).not.toBeInTheDocument();
        

    });
});
