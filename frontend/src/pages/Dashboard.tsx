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
import logo from "../assets/logo.png"
import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

function Dashboard(): ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { logout } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutoSave = useRef(false);
  const lastUpdateRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit, Markdown,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();
      setContent(markdown);
      setNotes((prev) => prev.map((note) => note.id === selectedId ? { ...note, content: markdown } : note));
    }
  });
  const selectedNote = notes.find((note) => note.id === selectedId);


  useEffect(() => {
    async function fetchNotes() {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0) {
          setSelectedId(fetchedNotes[0].id);
          lastUpdateRef.current = fetchedNotes[0].updatedAt;
        }
      } catch (err) {
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
    } catch (err) {
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
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;

      }
      if (selectedNote) {
        await deleteNote(selectedNote.id);
        const rest = notes.filter((note) => note.id !== selectedNote.id);
        setNotes(rest);
        setSelectedId(rest[0]?.id ?? null);
      }
    } catch (err) {
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
      lastUpdateRef.current = createdNote.updatedAt;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };


  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }


    if (!selectedNote) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    saveTimeoutRef.current = setTimeout(async () => {
      try {

        if (!lastUpdateRef.current) {
          setSaveStatus("error");
          setError("Missing note update");
          return;
        }
        const updatedNote = await updateNote(selectedNote.id, title, content, lastUpdateRef.current);
        setNotes((this_notes) =>
          this_notes.map((note) =>
            note.id === selectedNote.id ? updatedNote : note
          ));
        setSaveStatus("saved");
        lastUpdateRef.current = updatedNote.updatedAt;

      } catch (err) {
        setSaveStatus("error");
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.msg || "Failed to save ntoe");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      }
    }, 900);


    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content]);

  // useEffect(() => {
  //   if (selectedNote) {
  //     setTitle(selectedNote.title || "");
  //     setContent(selectedNote.content || "");
  //   } else {
  //     setTitle("");
  //     setContent("");
  //   }
  // }, [selectedNote]);
  useEffect(() => {
    skipAutoSave.current = true;
    if (!editor) {
      return;
    }

    const selectedNote = notes.find((n) => n.id === selectedId);

    if (selectedNote) {
      lastUpdateRef.current = selectedNote.updatedAt;
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      editor.commands.setContent(selectedNote.content || "", { emitUpdate: false, contentType: "markdown" });
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedId, editor]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    // Main container
    <div className="flex flex-col h-screen font-mono bg-[#282828]">
      {error && (
        <div className="absolute top-5 right-5 z-100 rounded-md border border-[#fb4934] bg-[#fb4934] px-4 py-4 text-sm text-[#282828]">
          {error}
        </div>
      )}

      {/* tooldbar */}
      <div className="relative z-50 flex flex-row h-12 shrink-0 bg-[#3c3836] h-10 shrink-0 items-center gap-2 px-3 rounded-lg mb-3 ">

        <button className="rounded-md px-2 py-2 text-xl text-[#ebdbb2] hover:text-[#504945]"

          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }}>
          ☰
        </button>

        <div className="flex items-center gap-2">
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</button>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</button>
        </div>
      </div>

      {/* {sidebar continer} */}
      <div className="relative flex flex-1 min-h-0 gap-3">
        {!isSidebarCollapsed && (

          <div
            className={`flex h-full flex-col rounded-2xl border shrink-0 border-b border-[#504945] bg-[#3c3836] ${isSidebarCollapsed ? "w-16" : "w-64"}`}
          >
            {/* sidebar header */}
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center px-4 py-4" : "justify-between px-2 py-4"}`}>

              <div className="flex items-center gap-3">

                <img
                  src={logo}
                  alt="Notes logo"
                  className="h-10 w-10 shrink-0 object-contain"
                />

                {!isSidebarCollapsed && (
                  <h1 className="text-lg font-semibold text-[#ebdbb2]">
                    Notes
                  </h1>
                )}
              </div>


              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="rounded-md px-2 py-1 text-[#928374] hover:bg-[#504945]">
                {isSidebarCollapsed ? "→" : "←"}
              </button>
            </div>

            <div className="px-3 pb-3">
              <button
                onClick={handleCreate}
                className={`rounded-md border border-[#504945] bg-[#282828] p-4 text-[#ebdbb2] hover:bg-[#504945] w-full
                ${isSidebarCollapsed ? "text-xl" : "px-4;"}`}
              >
                {isSidebarCollapsed ? "+" : "Create Note"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedId(note.id)
                    const mynote = notes.find((n) => n.id == note.id);
                    if (mynote) {
                      lastUpdateRef.current = mynote.updatedAt;
                    }
                  }}
                  className={`px-2 py-2 w-full rounded-md text-sm transition ${note.id == selectedId ? "bg-[#675e59] text-[#ebdbb2]" : "text-[#ebdbb2] hover:bg-[#50942]"}`}
                >
                  {note.title || "Untitled"}
                </button>
              ))}
            </div>

            <div className="flex items-center p-4 justify-between border-t border-[#504945]">
              <button
                onClick={handleLogout}
                className="rounded-lg border border-[#504945] bg-[#282828] p-4 text-[#ebdbb2] hover:bg-[#504945]"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className="relative z-0 min-w-0 flex-1 overflow-y-auto bg-[#3c3836] p-4">
          {selectedNote ? (
            <div className="mx-auto max-w-4xl p-8 h-full">
              <div className="px-6 py-4">
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setNotes((prev) => prev.map((note) => note.id === selectedId ? {...note, title: e.target.value} : note));
                  }}
                  placeholder="title"
                  className="border-none bg-transparent text-3xl font-semibold outline-none text-[#ebdbb2] placeholder-[#928374]"
                />
              </div>


              {/* <div>
                <textarea
                  ref = {textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  placeholder="content"
                  className="w-full  outline-none border-none bg-transparent border-gray-900 py-2 resize-none text-base text-[#ebdbb2] placeholder-[#928374]"
                />
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              
              </div> */}
              <EditorContent editor={editor}
                className="editor prose prose-invert"
              />

              <div className="flex items-center justify-between py-3 mt-2">
                {/* <button
                  onClick={handleSave}
                  className="rounded-lg border border-[#b8bb26] bg-[#b8bb26] text-[#282828] px-5 py-2 text-sm font-medium  hover:bg-[#98971a] transition"
                >
                  Save
                </button> */}
                <span className="text-sm text-[#928374]">
                  {saveStatus == "saving" && "Saving..."}
                  {saveStatus == "saved" && "Saved..."}
                  {saveStatus == "error" && "Failed to save..."}
                </span>

                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-[#fb4934] text-[#fb4934] px-5 py-2 text-sm font-medium  hover:bg-[#282828] transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className=" flex flex-col text-[#928374] items-center h-full justify-center">
              <p>Nothing Selected</p>
              <button
                onClick={handleCreate}
                className={`rounded-md border border-[#504945] bg-[#282828] text-[#ebdbb2] hover:bg-[#504945] transition  font-medium px-4 py-4 mt-4 text-sm`}
              >
                Create Note
              </button>
            </div>


          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
