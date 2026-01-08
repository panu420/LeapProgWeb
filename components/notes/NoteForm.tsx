"use client";

import { useState } from "react";

interface NoteFormProps {
  onCreate: (payload: {
    titolo: string;
    contenuto?: string;
    generateWithAI: boolean;
    subjectQuery?: string;
    details?: string;
  }) => Promise<void>;
}

export function NoteForm({ onCreate }: NoteFormProps) {
  const [titolo, setTitolo] = useState("");
  const [contenuto, setContenuto] = useState("");
  const [generateWithAI, setGenerateWithAI] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onCreate({
        titolo,
        contenuto: generateWithAI ? undefined : contenuto,
        generateWithAI,
        subjectQuery: generateWithAI ? subjectQuery : undefined,
        details: generateWithAI ? details : undefined,
      });
      setTitolo("");
      setContenuto("");
      setSubjectQuery("");
      setDetails("");
      setGenerateWithAI(false);
    } catch (err: any) {
      setError(err.message || "Errore creazione appunto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Titolo
          </label>
          <input
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Es. Rivoluzione Francese"
          />
        </div>
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Genera con AI
            </p>
            <p className="text-xs text-gray-500">
              Usa OpenRouter per creare l&apos;appunto
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">
              💰 Costo: 10 coin (gratuito per utenti abbonati)
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={generateWithAI}
              onChange={(e) => setGenerateWithAI(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 transition-colors"></div>
          </label>
        </div>
      </div>

      {generateWithAI ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Argomento principale
            </label>
            <input
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es. Teorema di Pitagora"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Dettagli aggiuntivi (opzionali)
            </label>
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Stile, focus, richieste specifiche"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Contenuto
          </label>
          <textarea
            value={contenuto}
            onChange={(e) => setContenuto(e.target.value)}
            required
            rows={6}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Scrivi qui i tuoi appunti..."
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading
          ? generateWithAI
            ? "Generazione in corso..."
            : "Salvataggio..."
          : generateWithAI
          ? "Genera Appunto"
          : "Salva Appunto"}
      </button>
    </form>
  );
}

