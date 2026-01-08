/**
 * Componente Lista Vero/Falso
 * Mostra tutti gli esercizi Vero/Falso salvati con statistiche
 */

"use client";

import Link from "next/link";

interface VeroFalsoSummary {
  id: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
  createdAt: string;
}

interface VeroFalsoListProps {
  veroFalso: VeroFalsoSummary[];
  onDelete: (id: number) => Promise<void>;
}

export function VeroFalsoList({ veroFalso, onDelete }: VeroFalsoListProps) {
  if (veroFalso.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nessun esercizio Vero/Falso salvato. Generane uno con l&apos;AI!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {veroFalso.map((vf) => (
        <article
          key={vf.id}
          className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{vf.titolo}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {vf.difficolta.toUpperCase()} • {vf.totalQuestions} affermazioni •{" "}
              {new Date(vf.createdAt).toLocaleDateString("it-IT")}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span>
                Tentativi: <strong>{vf.completedAttempts}</strong>
              </span>
              {vf.bestScore != null && (
                <span>
                  Miglior punteggio:{" "}
                  <strong>
                    {vf.bestScore}/{vf.totalQuestions}
                  </strong>
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/vero-falso/${vf.id}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Apri esercizio
            </Link>
            <button
              onClick={() => onDelete(vf.id)}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Elimina
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

