import { useEffect, useState, type ReactElement } from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../handlers/noteHandlers";
import { useAuth } from "../context/AuthContext";
import { type Note } from "../types/notes";
import axios from "axios";

function Dashboard(): ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { logout } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0) {
          setSelectedId(fetchedNotes[0].id);
        }
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.msg || "Login failed");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      }
    }
    fetchNotes();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedNote) {
        await deleteNote(selectedNote.id);
        const rest = notes.filter((note) => note.id !== selectedNote.id);
        setNotes(rest);
        setSelectedId(rest[0]?.id ?? null);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleCreate = async () => {
    try {
      const createdNote = await createNote("Untitled Noted");
      setNotes((currentNotes) => [createdNote, ...currentNotes]);
      setSelectedId(createdNote.id);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedNote) {
        const updatedNote = await updateNote(selectedNote.id, title, content);

        setNotes((currentNotes) => {
          return currentNotes.map((note) => {
            if (note.id === selectedNote.id) {
              return updatedNote;
            }

            return note;
          });
        });
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const selectedNote = notes.find((note) => note.id === selectedId);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedNote]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    // Main container
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {error && (
        <div className="absolute top-5 right-5 z-100 rounded-md border bg-red-500 px-4 py-4 text-sm text-white">
          {error}
        </div>
      )}

      {/* {sidebar continer} */}
      <div
        className={`flex flex-col bg-white w-50 border-r border-gray-200 h-full transition-all duration-200 ${isSidebarCollapsed ? "w-16" : "w-64"}`}
      >
        {/* sidebar header */}
        <div className="flex flex-col items-center px-4 py-6 justify-between border-b border-gray-200">
          <img
            src={"src/assets/logo.png"}
            alt="Notes logo"
            className="h-10 w-10 shrink-0 object-contain"
          />

          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">Notes</h1>
              <button onClick={() => setIsSidebarCollapsed(true)}>←</button>
            </div>
          )}
          {isSidebarCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">Notes</h1>
              <button onClick={() => setIsSidebarCollapsed(false)}>→</button>
            </div>
          )}
          <button
            onClick={handleCreate}
            className="rounded-md border border-gray-300 bg-white p-4 text-black hover:bg-gray-50"
          >
            Create Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className="px-2 py-2 w-full rounded-md text-sm"
            >
              {note.title || "Untitled"}
            </button>
          ))}
        </div>

        <div className="flex items-center p-4 justify-between border-b border-gray-200">
          <button
            onClick={handleLogout}
            className="rounder border border-gray-300 bg-white p-4 text-black hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedNote ? (
          <div className="mx-auto max-w-4xl p-8">
            <div className="px-6 py-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="title"
                className="border-none bg-transparent text-3xl font-semibold outline-none"
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder="content"
              className="w-full border-none bg-transparent border-gray-900 py-2 text-base resize-none"
            />

            <div className="flex items-center justify-between py-3">
              <button
                onClick={handleSave}
                className="rounded-md border border-gray-900 bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Save
              </button>

              <button
                onClick={handleDelete}
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div> Nothing Selected </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
