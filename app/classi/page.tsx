/**
 * Pagina gestione classi
 * Lista classi, creazione e unione
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { ClassiClient } from '@/components/classi/ClassiClient';

export default async function ClassiPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const db = getDatabase();

  // Recupera classi a cui lo studente appartiene
  const classi = db
    .prepare(
      `SELECT c.id, c.nome, c.codice, c.creatoreId, c.createdAt,
              CASE WHEN c.creatoreId = ? THEN 1 ELSE 0 END as isCreator
       FROM classe c
       INNER JOIN studente_classe sc ON c.id = sc.classeId
       WHERE sc.studenteId = ?
       ORDER BY c.createdAt DESC`
    )
    .all(user.id, user.id) as Array<{
    id: number;
    nome: string;
    codice: string;
    creatoreId: number;
    createdAt: string;
    isCreator: number;
  }>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con pulsante back alla dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-600 font-semibold">
              Social Learning
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Le Mie Classi</h1>
            <p className="text-gray-600 mt-1">
              Crea una classe o unisciti a una esistente per condividere appunti e competere nella classifica.
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

        <ClassiClient initialClassi={classi} />
      </div>
    </div>
  );
}

