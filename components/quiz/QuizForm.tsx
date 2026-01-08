"use client";

import { useState } from "react";

interface QuizFormProps {
  appunti: Array<{ id: number; titolo: string }>;
  onCreate: (payload: {
    titolo: string;
    subject: string;
    difficolta: string;
    numDomande: number;
    appuntoId?: number;
  }) => Promise<void>;
}

export function QuizForm({ appunti, onCreate }: QuizFormProps) {
  const [titolo, setTitolo] = useState("");
  const [subject, setSubject] = useState("");
  const [difficolta, setDifficolta] = useState("media");
  const [numDomande, setNumDomande] = useState(5);
  const [appuntoId, setAppuntoId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({
        titolo,
        subject,
        difficolta,
        numDomande,
        appuntoId,
      });
      setTitolo("");
      setSubject("");
      setDifficolta("media");
      setNumDomande(5);
      setAppuntoId(undefined);
    } catch (err: any) {
      setError(err.message || "Errore durante la creazione del quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Titolo quiz
          </label>
          <input
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Es. Quiz sulla fotosintesi"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Argomento principale
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required={!appuntoId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Es. Reazioni chimiche"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se scegli un appunto puoi lasciare vuoto questo campo: useremo il
            contenuto dell&apos;appunto come contesto del quiz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Difficoltà
          </label>
          <select
            value={difficolta}
            onChange={(e) => setDifficolta(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="facile">Facile</option>
            <option value="media">Media</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Numero domande
          </label>
          <input
            type="number"
            min={3}
            max={8}
            value={numDomande}
            onChange={(e) => setNumDomande(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Appunto di riferimento (opzionale)
          </label>
          <select
            value={appuntoId ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setAppuntoId(value);
              if (value) {
                setSubject("");
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Nessuno</option>
            {appunti.map((note) => (
              <option key={note.id} value={note.id}>
                {note.titolo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          💰 Costo: <span className="font-semibold">5 coin</span> per generare (gratuito per utenti abbonati)
        </p>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Generazione in corso..." : "Genera quiz con AI"}
        </button>
      </div>
    </form>
  );
}

