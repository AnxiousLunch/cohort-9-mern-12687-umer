import { useEffect, useState, type ReactElement } from "react"
import { getNotes } from "../handlers/noteHandlers";
import { useAuth } from "../context/AuthContext";


function Dashboard(): ReactElement {
  const [notes, setNotes] = useState([]);
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

  return (
    <>
      <div style={{ display: "flex", height: "100vh" }}> 
        <button onClick={handleLogout}>
          Logout
        </button>
          <div className="w-[200px] border-1 p-10">
              {notes.map((note) => (
                <button
                  key={note.id}
                >
                  {note.title || "Untitled"}
                </button>
              ))}
            </div>

      </div>
    </>
  )
}

export default Dashboard;
