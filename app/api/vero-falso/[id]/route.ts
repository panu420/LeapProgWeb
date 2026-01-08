/**
 * API Route: GET/DELETE /api/vero-falso/:id
 * Gestisce dettaglio e eliminazione di un esercizio Vero/Falso
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
  const veroFalso = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM vero_falso WHERE id = ? AND studenteId = ?`
    )
    .get(Number(id), user.id);

  if (!veroFalso) {
    return NextResponse.json(
      { error: 'Vero/Falso non trovato' },
      { status: 404 }
    );
  }

  const statements = db
    .prepare(
      `SELECT id, affermazione, rispostaCorretta, ordine
       FROM domanda_vero_falso
       WHERE veroFalsoId = ?
       ORDER BY ordine ASC`
    )
    .all(Number(id)) as Array<{
    id: number;
    affermazione: string;
    rispostaCorretta: number;
    ordine: number;
  }>;

  return NextResponse.json({
    veroFalso: {
      ...veroFalso,
      questions: statements.map((s) => ({
        id: s.id,
        affermazione: s.affermazione,
        rispostaCorretta: s.rispostaCorretta === 1,
        ordine: s.ordine,
      })),
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM domanda_vero_falso WHERE veroFalsoId = ?').run(
      Number(id)
    );
    const result = db
      .prepare('DELETE FROM vero_falso WHERE id = ? AND studenteId = ?')
      .run(Number(id), user.id);
    return result.changes;
  });

  const changes = transaction();

  if (changes === 0) {
    return NextResponse.json(
      { error: 'Vero/Falso non trovato' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

