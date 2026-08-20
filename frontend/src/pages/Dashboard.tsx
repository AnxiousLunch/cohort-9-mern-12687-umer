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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutoSave = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lastUpdateRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit, Markdown,
    ], 
    content: content,
    onUpdate: ({editor}) => {
      const markdown  = editor.getMarkdown();
      setContent(markdown);
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

      } catch(err) {
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

  const applyFormatting = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selectedArea = content.substring(start, end);

    const updatedContent = content.substring(0, start) + prefix + selectedArea + suffix + content.substring(end);

    setContent(updatedContent);

  }

  const formatEntireLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selectedArea = content.substring(start, end);
    
    const lines = selectedArea.split('\n');
    const newlines = lines.map(line => line.trim() ? prefix + line : line);
    const newselectedArea = newlines.join('\n');

    const newcontent = content.substring(0, start) + newselectedArea + content.substring(end);

  }


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

    if (selectedNote) {
      setTitle(selectedNote.title || ""); 
      editor.commands.setContent(selectedNote.content || "", {emitUpdate: false});
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedNote, editor]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    // Main container
    <div className="flex flex-col h-screen p-3 gap-3 font-mono bg-[#282828]">
      {error && (
        <div className="absolute top-5 right-5 z-100 rounded-md border border-[#fb4934] bg-[#fb4934] px-4 py-4 text-sm text-[#282828]">
          {error}
        </div>
      )}

      {/* tooldbar */}
      <div className="flex flex-row bg-[#3c3836] h-10 shrink-0 items-center gap-2 px-3 rounded-lg ">
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
           onClick={() => editor?.chain().focus().toggleHeading({level: 1}).run()}>H1</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
          onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()}>H2</button>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
          <button className="rounded-md px-2 py-1 text-sm text-[#ebdbb2] hover:bg-[#504945] transition"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</button>
        </div>
      </div>
      
      {/* {sidebar continer} */}
      <div className="flex flex-1 min-h-0 gap-3">

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
              className="rounder border border-[#504945] bg-[#282828] p-4 text-[#ebdbb2] hover:bg-[#504945]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 p-4 overflow-y-auto border-[#504945] bg-[#3c3836] rounded-2xl">
          {selectedNote ? (
            <div className="mx-auto max-w-4xl p-8 h-full">
              <div className="px-6 py-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
             className="editor"
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
            <div className="text-[#928374]  flex h-full justify-center"> Nothing Selected </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
