import api from "../api/axios";
import type { Note } from "../types/notes";


type NotesListResponse = {
  notes: Note[];
};

type NoteMutationResponse = {
  note: Note;
};


export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get<NotesListResponse>("/notes");
  return response.data.notes;
};

export const getNote = async (id: number): Promise<Note> => {
  const response = await api.get<NoteMutationResponse>(`/notes/${id}`);
  return response.data.note;
};

export const createNote = async (
  title: string,
  content = ""
): Promise<Note> => {
  const response = await api.post<NoteMutationResponse>("/notes", { title, content });
  return response.data.note;
};

export const updateNote = async (
  id: number,
  title: string,
  content: string,
  lastSeenUpdatedAt: string
): Promise<Note> => {
  const response = await api.put<NoteMutationResponse>(`/notes/${id}`, { title, content, lastSeenUpdatedAt });
  return response.data.note;
};

export const deleteNote = async (id: number): Promise<void> => {
  await api.delete(`/notes/${id}`);
};
