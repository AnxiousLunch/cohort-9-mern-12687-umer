import { useEffect, useState, type ReactElement } from "react"
import { createNote, deleteNote, getNotes, updateNote } from "../handlers/noteHandlers";
import { useAuth } from "../context/AuthContext";


function Dashboard(): ReactElement {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const {logout} = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function fetchNotes() {
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
       if (fetchedNotes.length > 0) {
        setSelectedId(fetchedNotes[0].id);
      }

    }
    fetchNotes();
  }, []);

  const handleLogout = async () => {
    await logout();
  }

  const handleDelete = async () => {
    await deleteNote(selectedNote.id);
    const rest = notes.filter((note) => note.id !== selectedNote.id);
    setNotes(rest);
    setSelectedId(rest[0].id || null);
  }

  const handleCreate = async () => {
    const createdNote = await createNote("Untitled Noted");
    setNotes([createdNote, ...notes]);
    setSelectedId(createdNote.id);
  }

  const handleSave = async() => {
    const updatedNote = await updateNote(selectedNote.id, title,content);

    setNotes((currentNotes) => {
      return currentNotes.map((note) => {
        if (note.id === selectedNote.id) {
          return updatedNote;
        }

        return note;
      });
    });
  }

  const selectedNote = notes.find((note) => note.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900"> 


      <div className="flex  flex-col bg-white w-50 border-r border-gray-200 p-10">

        <div className="flex flex-col items-center px-4 py-6 justify-between border-b border-gray-200">
          <h1 className="text-lg font-semibold">Notes</h1>
          <button onClick={handleCreate}
          className="rounded-md border border-gray-300 bg-white p-4 text-black hover:bg-gray-50">
            Create Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={()  => setSelectedId(note.id)}
            >
              {note.title || "Untitled"}
            </button>
          ))}
        </div>

        <div className="flex items-center p-4 justify-between border-b border-gray-200">
          <button onClick={handleLogout}
          className="rounder border border-gray-300 bg-white p-4 text-black hover:bg-gray-50">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {selectedNote ? (
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder="content"
              className="w-full"
            /> 
            <button onClick={handleSave}>Save</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        ) : (
          <div> Nothing Selected </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard;
