import AsyncStorage from "@react-native-async-storage/async-storage";

import { NoteInput, NoteRecord } from "./types";

export const NOTES_STORAGE_KEY = "sahej-notes";

function generateNoteId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseNotes(value: string | null): NoteRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as NoteRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeNotes(notes: NoteRecord[]) {
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sortedNotes));
}

export async function listNotes(): Promise<NoteRecord[]> {
  try {
    const storedValue = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return parseNotes(storedValue).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function getNoteById(id: string): Promise<NoteRecord | null> {
  const notes = await listNotes();
  return notes.find((note) => note.id === id) ?? null;
}

export async function createNote(input: NoteInput): Promise<NoteRecord> {
  const now = new Date().toISOString();
  const notes = await listNotes();

  const nextNote: NoteRecord = {
    id: generateNoteId(),
    title: input.title.trim() || "Untitled Note",
    body: input.body,
    tags: input.tags,
    linkedReflectionId: input.linkedReflectionId,
    createdAt: now,
    updatedAt: now
  };

  try {
    await writeNotes([...notes, nextNote]);
  } catch {
    // Note persistence should not crash the app.
  }

  return nextNote;
}

export async function updateNote(
  id: string,
  updates: Partial<Omit<NoteRecord, "id" | "createdAt">>
): Promise<NoteRecord | null> {
  const notes = await listNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const current = notes[index];
  const updated: NoteRecord = {
    ...current,
    ...updates,
    title: (updates.title ?? current.title).trim() || "Untitled Note",
    tags: updates.tags ?? current.tags,
    updatedAt: new Date().toISOString()
  };

  const nextNotes = [...notes];
  nextNotes[index] = updated;

  try {
    await writeNotes(nextNotes);
  } catch {
    // Note persistence should not crash the app.
  }

  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await listNotes();
  const nextNotes = notes.filter((note) => note.id !== id);

  try {
    await writeNotes(nextNotes);
  } catch {
    // Note persistence should not crash the app.
  }
}

export async function replaceNotes(notes: NoteRecord[]): Promise<void> {
  try {
    await writeNotes(notes);
  } catch {
    // Note persistence should not crash the app.
  }
}

export async function clearNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
  } catch {
    // Note persistence should not crash the app.
  }
}
