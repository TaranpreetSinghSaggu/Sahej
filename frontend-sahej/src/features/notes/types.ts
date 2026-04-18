export interface NoteRecord {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedReflectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  body: string;
  tags: string[];
  linkedReflectionId?: string;
}
