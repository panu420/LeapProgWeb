/**
 * API Route: POST /api/vero-falso/:id/submit
 * Valuta le risposte di un esercizio Vero/Falso e assegna punti
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { awardPoints } from '@/lib/points';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const { answers } = await request.json();
  if (!Array.isArray(answers)) {
    return NextResponse.json(
      { error: 'Risposte non valide' },
      { status: 400 }
    );
  }

  const db = getDatabase();
  const veroFalso = db
    .prepare(
      `SELECT id, studenteId, totalQuestions, completedAttempts, bestScore
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
      `SELECT id, affermazione, rispostaCorretta
       FROM domanda_vero_falso WHERE veroFalsoId = ? ORDER BY ordine ASC`
    )
    .all(Number(id)) as Array<{
    id: number;
    affermazione: string;
    rispostaCorretta: number;
  }>;

  if (statements.length === 0) {
    return NextResponse.json(
      { error: 'Il vero/falso non contiene affermazioni' },
      { status: 400 }
    );
  }

  const details = statements.map((statement, index) => {
    const answer = answers[index];
    const correctAnswer = statement.rispostaCorretta === 1;
    const selectedAnswer =
      typeof answer === 'boolean' ? answer : answer === true || answer === 1;
    const isCorrect = selectedAnswer === correctAnswer;

    return {
      id: statement.id,
      affermazione: statement.affermazione,
      selectedAnswer,
      correctAnswer,
      isCorrect,
    };
  });

  const correct = details.filter((detail) => detail.isCorrect).length;
  const total = details.length;
  const pointsEarned = correct * 10;
  const { newPoints, newLevel } = awardPoints(user.id, pointsEarned);

  db.prepare(
    `UPDATE vero_falso
     SET lastScore = ?, bestScore = MAX(COALESCE(bestScore, 0), ?),
         completedAttempts = completedAttempts + 1,
         lastCompletedAt = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(correct, correct, Number(id));

  return NextResponse.json({
    correctAnswers: correct,
    totalQuestions: total,
    pointsEarned,
    newPoints,
    newLevel,
    questions: details,
  });
}

