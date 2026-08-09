import api from "../api/axios";
import type { Note } from "../types/notes";

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get("/notes");
  return response.data.notes;
};

export const getNote = async (id: number): Promise<Note> => {
  const response = await api.get(`/notes/${id}`);
  return response.data.note;
};

export const createNote = async (
  title: string,
  content = ""
): Promise<Note> => {
  const response = await api.post("/notes", { title, content });
  return response.data.note;
};

export const updateNote = async (
  id: number,
  title: string,
  content: string
): Promise<Note> => {
  const response = await api.put(`/notes/${id}`, { title, content });
  return response.data.note;
};

export const deleteNote = async (id: number): Promise<void> => {
  await api.delete(`/notes/${id}`);
};
