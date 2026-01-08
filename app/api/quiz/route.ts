import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateQuizWithAI } from '@/lib/openrouter';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();
  const quizzes = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM quiz
       WHERE studenteId = ?
       ORDER BY createdAt DESC`
    )
    .all(user.id);

  return NextResponse.json({ quizzes });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const body = await request.json();
    const {
      titolo,
      subject,
      difficolta = 'media',
      numDomande = 5,
      appuntoId,
    } = body;

    let effectiveSubject = typeof subject === 'string' ? subject.trim() : '';

    if (!titolo) {
      return NextResponse.json(
        { error: 'Il titolo è obbligatorio' },
        { status: 400 }
      );
    }

    if (!effectiveSubject && !appuntoId) {
      return NextResponse.json(
        { error: 'Specificare un argomento o selezionare un appunto' },
        { status: 400 }
      );
    }

    let noteContent: string | undefined;
    if (appuntoId) {
      const note = db
        .prepare(
          'SELECT titolo, contenuto FROM appunto WHERE id = ? AND studenteId = ?'
        )
        .get(appuntoId, user.id) as
        | { contenuto: string; titolo: string }
        | undefined;
      if (!note) {
        return NextResponse.json(
          { error: 'Appunto non trovato' },
          { status: 404 }
        );
      }
      noteContent = note.contenuto;
      if (!effectiveSubject) {
        effectiveSubject = note.titolo;
      }
    }

    // Controlla se l'utente può usare l'AI (abbonamento o coin sufficienti)
    const { canUseAI, deductCoins, AI_COSTS, isSubscribed } = await import('@/lib/coins');
    const check = canUseAI(user.id, AI_COSTS.GENERATE_QUIZ);
    
    if (!check.canUse) {
      return NextResponse.json(
        { 
          error: check.reason || 'Non puoi usare questa funzione',
          requiresPayment: true,
          cost: AI_COSTS.GENERATE_QUIZ
        },
        { status: 403 }
      );
    }

    // Se non è abbonato, deduci i coin
    if (!isSubscribed(user.id)) {
      deductCoins(user.id, AI_COSTS.GENERATE_QUIZ);
    }

    const aiResult = await generateQuizWithAI({
      subject: effectiveSubject || titolo,
      difficulty: difficolta,
      numQuestions: numDomande,
      noteContent,
    });

    const quizTransaction = db.transaction(() => {
      const insertQuiz = db.prepare(
        `INSERT INTO quiz (appuntoId, studenteId, titolo, difficolta, totalQuestions)
         VALUES (?, ?, ?, ?, ?)`
      );

      const quizResult = insertQuiz.run(
        appuntoId ?? null,
        user.id,
        titolo,
        difficolta,
        aiResult.questions.length
      );

      const quizId = Number(quizResult.lastInsertRowid);

      const insertQuestion = db.prepare(
        `INSERT INTO domanda_quiz
        (quizId, domanda, opzione1, opzione2, opzione3, opzione4, rispostaCorretta, ordine)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      aiResult.questions.forEach((question, index) => {
        insertQuestion.run(
          quizId,
          question.question,
          question.options[0],
          question.options[1],
          question.options[2],
          question.options[3],
          question.correctIndex + 1, // DB usa 1-4
          index + 1
        );
      });

      return quizId;
    });

    const quizId = quizTransaction();

    const quiz = db
      .prepare(
        `SELECT id, titolo, difficolta, totalQuestions, createdAt,
                lastScore, bestScore, completedAttempts
         FROM quiz WHERE id = ?`
      )
      .get(quizId);

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error('Errore creazione quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Errore interno' },
      { status: 500 }
    );
  }
}

