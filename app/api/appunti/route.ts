import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateNoteWithAI } from '@/lib/openrouter';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();
  const notes = db
    .prepare(
      'SELECT id, studenteId, titolo, contenuto, createdAt, updatedAt FROM appunto WHERE studenteId = ? ORDER BY createdAt DESC',
    )
    .all(user.id);

  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const {
      titolo,
      contenuto,
      generateWithAI,
      subjectQuery,
      details,
    } = body;

    if (!titolo || (!generateWithAI && !contenuto)) {
      return NextResponse.json(
        { error: 'Titolo e contenuto sono obbligatori' },
        { status: 400 },
      );
    }

    const db = getDatabase();
    let finalContent = contenuto;

    if (generateWithAI) {
      if (!subjectQuery) {
        return NextResponse.json(
          { error: 'Subject necessario per generazione AI' },
          { status: 400 },
        );
      }

      // Controlla se l'utente può usare l'AI (abbonamento o coin sufficienti)
      const { canUseAI, deductCoins, AI_COSTS, isSubscribed } = await import('@/lib/coins');
      const check = canUseAI(user.id, AI_COSTS.GENERATE_NOTE);
      
      if (!check.canUse) {
        return NextResponse.json(
          { 
            error: check.reason || 'Non puoi usare questa funzione',
            requiresPayment: true,
            cost: AI_COSTS.GENERATE_NOTE
          },
          { status: 403 },
        );
      }

      // Se non è abbonato, deduci i coin
      if (!isSubscribed(user.id)) {
        deductCoins(user.id, AI_COSTS.GENERATE_NOTE);
      }

      finalContent = await generateNoteWithAI({
        subjectQuery,
        details,
      });
    }

    const result = db
      .prepare(
        'INSERT INTO appunto (studenteId, titolo, contenuto) VALUES (?, ?, ?)',
      )
      .run(user.id, titolo, finalContent);

    const newNote = db
      .prepare(
        'SELECT id, studenteId, titolo, contenuto, createdAt, updatedAt FROM appunto WHERE id = ?',
      )
      .get(result.lastInsertRowid);

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error: any) {
    console.error('Errore creazione appunto:', error);
    return NextResponse.json(
      { error: error.message || 'Errore interno' },
      { status: 500 },
    );
  }
}

