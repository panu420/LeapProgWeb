/**
 * Pagina dettaglio classe con classifica e appunti condivisi
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { ClasseDetailClient } from '@/components/classi/ClasseDetailClient';

export default async function ClasseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const db = getDatabase();

  // Verifica membership
  const membership = db
    .prepare(
      'SELECT id FROM studente_classe WHERE studenteId = ? AND classeId = ?'
    )
    .get(user.id, Number(id));

  if (!membership) {
    redirect('/classi');
  }

  // Recupera classe
  const classe = db
    .prepare('SELECT id, nome, codice, creatoreId, createdAt FROM classe WHERE id = ?')
    .get(Number(id)) as {
    id: number;
    nome: string;
    codice: string;
    creatoreId: number;
    createdAt: string;
  } | undefined;

  if (!classe) {
    redirect('/classi');
  }

  // Recupera classifica
  const classifica = db
    .prepare(
      `SELECT s.id, s.nome, s.punti, s.livello
       FROM studente s
       INNER JOIN studente_classe sc ON s.id = sc.studenteId
       WHERE sc.classeId = ?
       ORDER BY s.punti DESC, s.livello DESC, s.nome ASC`
    )
    .all(Number(id)) as Array<{
    id: number;
    nome: string;
    punti: number;
    livello: number;
  }>;

  // Recupera appunti condivisi
  const appunti = db
    .prepare(
      `SELECT a.id, a.titolo, a.studenteId, a.sharedAt, s.nome as autoreNome
       FROM appunto a
       INNER JOIN studente s ON a.studenteId = s.id
       WHERE a.classeId = ?
       ORDER BY a.sharedAt DESC`
    )
    .all(Number(id)) as Array<{
    id: number;
    titolo: string;
    studenteId: number;
    sharedAt: string;
    autoreNome: string;
  }>;

  // Recupera appunti dello studente per condivisione
  const myAppunti = db
    .prepare(
      `SELECT id, titolo FROM appunto 
       WHERE studenteId = ? AND (classeId IS NULL OR classeId != ?)
       ORDER BY createdAt DESC`
    )
    .all(user.id, Number(id)) as Array<{ id: number; titolo: string }>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con pulsanti di navigazione */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 font-semibold">Classe</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {classe.nome}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Codice: <span className="font-mono font-semibold">{classe.codice}</span>
            </p>
          </div>
          {/* Pulsanti di navigazione: torna alle classi e alla dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/classi"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Torna alle classi
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

        <ClasseDetailClient
          classeId={Number(id)}
          classifica={classifica}
          appunti={appunti}
          myAppunti={myAppunti}
          isCreator={classe.creatoreId === user.id}
        />
      </div>
    </div>
  );
}

