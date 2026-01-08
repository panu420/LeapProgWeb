/**
 * Pagina principale gestione Vero/Falso
 * Lista esercizi e form creazione
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { VeroFalsoClient } from "@/components/vero-falso/VeroFalsoClient";

export default async function VeroFalsoPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const db = getDatabase();

  // Recupera lista vero/falso
  const veroFalso = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, lastScore, bestScore,
              completedAttempts, createdAt
       FROM vero_falso
       WHERE studenteId = ?
       ORDER BY createdAt DESC`
    )
    .all(user.id) as Array<{
    id: number;
    titolo: string;
    difficolta: string;
    totalQuestions: number;
    lastScore: number | null;
    bestScore: number | null;
    completedAttempts: number;
    createdAt: string;
  }>;

  // Recupera appunti per il form
  const appunti = db
    .prepare("SELECT id, titolo FROM appunto WHERE studenteId = ?")
    .all(user.id) as Array<{ id: number; titolo: string }>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con pulsante back alla dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">
              Area Studio
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Vero/Falso
            </h1>
            <p className="text-gray-600 mt-1">
              Crea esercizi Vero/Falso generati con AI per testare le tue conoscenze.
            </p>
          </div>
          {/* Pulsante per tornare alla dashboard principale */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        <VeroFalsoClient initialVeroFalso={veroFalso} appunti={appunti} />
      </div>
    </div>
  );
}

