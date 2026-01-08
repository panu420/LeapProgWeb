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
  const quiz = db
    .prepare(
      `SELECT id, studenteId, totalQuestions, completedAttempts, bestScore
       FROM quiz WHERE id = ? AND studenteId = ?`
    )
    .get(Number(id), user.id);

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz non trovato' }, { status: 404 });
  }

  const questions = db
    .prepare(
      `SELECT id, domanda, opzione1, opzione2, opzione3, opzione4, rispostaCorretta
       FROM domanda_quiz WHERE quizId = ? ORDER BY ordine ASC`
    )
    .all(Number(id)) as Array<{
      id: number;
      domanda: string;
      opzione1: string;
      opzione2: string;
      opzione3: string;
      opzione4: string;
      rispostaCorretta: number;
    }>;

  if (questions.length === 0) {
    return NextResponse.json(
      { error: 'Il quiz non contiene domande' },
      { status: 400 }
    );
  }

  const details = questions.map((question, index) => {
    const answer = answers[index];
    const correctIndex = question.rispostaCorretta - 1;
    const options = [
      question.opzione1,
      question.opzione2,
      question.opzione3,
      question.opzione4,
    ];
    return {
      id: question.id,
      question: question.domanda,
      selectedIndex:
        typeof answer === 'number' && answer >= 0 ? answer : null,
      correctIndex,
      correctText: options[correctIndex],
      isCorrect: answer === correctIndex,
      options,
    };
  });

  const correct = details.filter((detail) => detail.isCorrect).length;
  const total = details.length;
  const pointsEarned = correct * 10;
  const { newPoints, newLevel } = awardPoints(user.id, pointsEarned);

  db.prepare(
    `UPDATE quiz
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

