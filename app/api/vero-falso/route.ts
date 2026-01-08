/**
 * API Route: GET/POST /api/vero-falso
 * Gestisce la lista e creazione di esercizi Vero/Falso
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateVeroFalsoWithAI } from '@/lib/openrouter';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();
  const veroFalsoList = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, lastScore, bestScore, 
              completedAttempts, createdAt
       FROM vero_falso 
       WHERE studenteId = ? 
       ORDER BY createdAt DESC`
    )
    .all(user.id);

  return NextResponse.json({ veroFalso: veroFalsoList });
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
      subject,
      difficolta = 'media',
      numDomande = 5,
      appuntoId,
    } = body;

    if (!titolo) {
      return NextResponse.json(
        { error: 'Titolo obbligatorio' },
        { status: 400 }
      );
    }

    if (!subject && !appuntoId) {
      return NextResponse.json(
        { error: 'Argomento o appunto obbligatorio' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Se è selezionato un appunto, recupera il contenuto
    let noteContent: string | undefined;
    let finalSubject = subject;

    if (appuntoId) {
      const appunto = db
        .prepare('SELECT titolo, contenuto FROM appunto WHERE id = ? AND studenteId = ?')
        .get(appuntoId, user.id) as { titolo: string; contenuto: string } | undefined;

      if (!appunto) {
        return NextResponse.json(
          { error: 'Appunto non trovato' },
          { status: 404 }
        );
      }

      noteContent = appunto.contenuto;
      // Se non c'è subject, usa il titolo dell'appunto
      if (!finalSubject) {
        finalSubject = appunto.titolo;
      }
    }

    // Controlla se l'utente può usare l'AI (abbonamento o coin sufficienti)
    const { canUseAI, deductCoins, AI_COSTS, isSubscribed } = await import('@/lib/coins');
    const check = canUseAI(user.id, AI_COSTS.GENERATE_VERO_FALSO);
    
    if (!check.canUse) {
      return NextResponse.json(
        { 
          error: check.reason || 'Non puoi usare questa funzione',
          requiresPayment: true,
          cost: AI_COSTS.GENERATE_VERO_FALSO
        },
        { status: 403 }
      );
    }

    // Se non è abbonato, deduci i coin
    if (!isSubscribed(user.id)) {
      deductCoins(user.id, AI_COSTS.GENERATE_VERO_FALSO);
    }

    // Genera vero/falso con AI
    const aiResult = await generateVeroFalsoWithAI({
      subject: finalSubject,
      difficulty: difficolta,
      numQuestions: numDomande,
      noteContent,
    });

    // Inserimento transazionale
    const transaction = db.transaction(() => {
      // Inserisci vero/falso
      const result = db
        .prepare(
          `INSERT INTO vero_falso 
           (studenteId, appuntoId, titolo, difficolta, totalQuestions)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          user.id,
          appuntoId || null,
          titolo,
          difficolta,
          aiResult.statements.length
        );

      const veroFalsoId = result.lastInsertRowid as number;

      // Inserisci affermazioni
      const insertStatement = db.prepare(
        `INSERT INTO domanda_vero_falso 
         (veroFalsoId, affermazione, rispostaCorretta, ordine)
         VALUES (?, ?, ?, ?)`
      );

      aiResult.statements.forEach((stmt, index) => {
        insertStatement.run(
          veroFalsoId,
          stmt.statement,
          stmt.correct ? 1 : 0,
          index + 1
        );
      });

      return veroFalsoId;
    });

    const veroFalsoId = transaction();

    // Recupera vero/falso creato
    const veroFalso = db
      .prepare(
        `SELECT id, titolo, difficolta, totalQuestions, createdAt
         FROM vero_falso WHERE id = ?`
      )
      .get(veroFalsoId);

    return NextResponse.json({ veroFalso });
  } catch (error: any) {
    console.error('Errore creazione vero/falso:', error);
    return NextResponse.json(
      { error: error.message || 'Errore nella creazione' },
      { status: 500 }
    );
  }
}

