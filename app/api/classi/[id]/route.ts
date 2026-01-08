/**
 * API Route: GET /api/classi/:id
 * Restituisce dettagli di una classe con classifica studenti
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();

  // Verifica che lo studente appartenga alla classe
  const membership = db
    .prepare(
      'SELECT id FROM studente_classe WHERE studenteId = ? AND classeId = ?'
    )
    .get(user.id, Number(id));

  if (!membership) {
    return NextResponse.json(
      { error: 'Non appartieni a questa classe' },
      { status: 403 }
    );
  }

  // Recupera informazioni classe
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
    return NextResponse.json({ error: 'Classe non trovata' }, { status: 404 });
  }

  // Recupera classifica studenti (ordinata per punti, poi livello)
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

  // Recupera appunti condivisi nella classe
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

  return NextResponse.json({
    classe: {
      ...classe,
      isCreator: classe.creatoreId === user.id,
    },
    classifica,
    appunti,
  });
}

