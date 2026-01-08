"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Nota } from "@/types/note";

interface NoteEditorProps {
  note: Nota | null;
  onUpdate: (payload: { id: number; titolo: string; contenuto: string }) => Promise<void>;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titolo, setTitolo] = useState("");
  const [contenuto, setContenuto] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (note) {
      setTitolo(note.titolo);
      setContenuto(note.contenuto);
      setMessage("");
      setIsEditing(false);
    } else {
      setTitolo("");
      setContenuto("");
      setIsEditing(false);
    }
  }, [note]);

  const handleSave = async () => {
    if (!note) return;
    setSaving(true);
    setMessage("");
    try {
      await onUpdate({ id: note.id, titolo, contenuto });
      setMessage("Appunto aggiornato");
      setIsEditing(false);
    } catch (error: any) {
      setMessage(error.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    if (note) {
      setTitolo(note.titolo);
      setContenuto(note.contenuto);
    }
    setIsEditing(false);
    setMessage("");
  };

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Seleziona un appunto dalla lista per visualizzarlo
      </div>
    );
  }

  // Modalità visualizzazione - solo Markdown renderizzato
  if (!isEditing) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{note.titolo}</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Modifica
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white p-6 prose prose-sm max-w-none prose-headings:mt-4 prose-p:leading-relaxed prose-li:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.contenuto || "*Nessun contenuto*"}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // Modalità editing
  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Titolo
        </label>
        <input
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Contenuto (Markdown)
        </label>
        <textarea
          value={contenuto}
          onChange={(e) => setContenuto(e.target.value)}
          className="flex-1 min-h-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Usa Markdown per titoli (##), elenchi (-) e grassetto (**testo**)..."
        />
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-60"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}

