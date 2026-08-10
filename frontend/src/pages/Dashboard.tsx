import { useEffect, useState, type ReactElement } from "react"
import { deleteNote, getNotes } from "../handlers/noteHandlers";
import { useAuth } from "../context/AuthContext";


function Dashboard(): ReactElement {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const {logout} = useAuth();

  useEffect(() => {
    async function fetchNotes() {
      const notes = await getNotes();
      setNotes(notes);

    }
    fetchNotes();
  }, []);

  const handleLogout = async () => {
    await logout();
  }

  const handleDelete = async (id) => {
    await deleteNote(id);
    const rest = notes.filter((note) => note.id !== id);
    setNotes(rest);
    setSelectedId(rest[0].id || null);
  }

  return (
    <>
      <div style={{ display: "flex", height: "100vh" }}> 
        <div className="w-[200px] border-1 p-10">
        <button onClick={handleLogout}>
          Logout
        </button>
          <div>
              {notes.map((note) => (
                <button
                  key={note.id}
                >
                  {note.title || "Untitled"}
                </button>
              ))}
            </div>

        </div>

      </div>
    </>
  )
}

export default Dashboard;
