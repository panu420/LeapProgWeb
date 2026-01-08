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
  const quiz = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM quiz WHERE id = ? AND studenteId = ?`
    )
    .get(Number(id), user.id);

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz non trovato' }, { status: 404 });
  }

  const questions = db
    .prepare(
      `SELECT id, domanda, opzione1, opzione2, opzione3, opzione4, ordine
       FROM domanda_quiz
       WHERE quizId = ?
       ORDER BY ordine ASC`
    )
    .all(Number(id));

  return NextResponse.json({ quiz: { ...quiz, questions } });
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
    db.prepare('DELETE FROM domanda_quiz WHERE quizId = ?').run(
      Number(id)
    );
    const result = db
      .prepare('DELETE FROM quiz WHERE id = ? AND studenteId = ?')
      .run(Number(id), user.id);
    return result.changes;
  });

  const changes = transaction();

  if (changes === 0) {
    return NextResponse.json({ error: 'Quiz non trovato' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

