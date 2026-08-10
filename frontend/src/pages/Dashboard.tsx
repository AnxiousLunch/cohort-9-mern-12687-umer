import { useEffect, useState, type ReactElement } from "react"
import { getNotes } from "../handlers/noteHandlers";


function Dashboard(): ReactElement {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function fetchNotes() {
      const notes = await getNotes();
      setNotes(notes);

    }
    fetchNotes();
  }, []);


  return (
    <>
      <div style={{ display: "flex", height: "100vh" }}> 

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
