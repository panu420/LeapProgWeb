/**
 * Tipi specifici per gli appunti
 */

export interface Nota {
  id: number;
  studenteId: number;
  titolo: string;
  contenuto: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteAIRequest {
  subjectQuery: string;
  details?: string;
}

