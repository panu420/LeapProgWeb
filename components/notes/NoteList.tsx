"use client";

import { Nota } from "@/types/note";

interface NoteListProps {
  notes: Nota[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
}

export function NoteList({
  notes,
  selectedId,
  onSelect,
  onDelete,
}: NoteListProps) {
  return (
    <div className="space-y-3">
      {notes.length === 0 && (
        <p className="text-sm text-gray-500">
          Nessun appunto ancora. Creane uno nuovo!
        </p>
      )}
      {notes.map((note) => (
        <article
          key={note.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedId === note.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-200"
          }`}
          onClick={() => onSelect(note.id)}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {note.titolo}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Creato il {new Date(note.createdAt).toLocaleDateString("it-IT")}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Elimina
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {note.contenuto.replace(/[#*]/g, "").slice(0, 120)}
            {note.contenuto.length > 120 ? "..." : ""}
          </p>
        </article>
      ))}
    </div>
  );
}

