/**
 * Pagina dettaglio e esecuzione esercizio Vero/Falso
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { VeroFalsoRunner } from "@/components/vero-falso/VeroFalsoRunner";

/**
 * Interfaccia per i dati del vero/falso dal database
 */
interface VeroFalsoRow {
  id: number;
  studenteId: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  createdAt: string;
  lastScore: number | null;
  bestScore: number | null;
  completedAttempts: number;
}

interface StatementDto {
  id: number;
  affermazione: string;
  rispostaCorretta: number; // 0 o 1
  ordine: number;
}

export default async function VeroFalsoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const db = getDatabase();
  const veroFalso = db
    .prepare(
      `SELECT id, studenteId, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM vero_falso WHERE id = ? AND studenteId = ?`
    )
    .get(Number(id), user.id) as VeroFalsoRow | undefined;

  if (!veroFalso) {
    redirect("/vero-falso");
  }

  const statements = db
    .prepare(
      `SELECT id, affermazione, rispostaCorretta, ordine
       FROM domanda_vero_falso WHERE veroFalsoId = ? ORDER BY ordine ASC`
    )
    .all(Number(id)) as StatementDto[];

  const formattedQuestions = statements.map((stmt) => ({
    id: stmt.id,
    affermazione: stmt.affermazione,
    rispostaCorretta: stmt.rispostaCorretta === 1,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con pulsanti di navigazione */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-semibold">
              Vero/Falso • {veroFalso.difficolta.toUpperCase()}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {veroFalso.titolo}
            </h1>
            <p className="text-sm text-gray-500">
              Creato il {new Date(veroFalso.createdAt).toLocaleDateString("it-IT")}
            </p>
          </div>
          {/* Pulsanti di navigazione: torna agli esercizi e alla dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/vero-falso"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Torna agli esercizi
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>

        <VeroFalsoRunner
          veroFalsoId={veroFalso.id}
          totalQuestions={veroFalso.totalQuestions}
          completedAttempts={veroFalso.completedAttempts}
          bestScore={veroFalso.bestScore ?? undefined}
          questions={formattedQuestions}
        />
      </div>
    </div>
  );
}

