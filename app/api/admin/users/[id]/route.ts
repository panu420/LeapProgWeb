/**
 * API Route: GET /api/admin/users/[id]
 * Restituisce i dettagli completi di un utente (appunti, classi, quiz, vero/falso)
 * Accessibile solo agli amministratori
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica autenticazione
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  // Verifica che l'utente sia admin
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Accesso negato. Solo amministratori.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: 'ID utente non valido' },
      { status: 400 }
    );
  }

  const db = getDatabase();

  // Ottieni i dati dell'utente
  const studente = db
    .prepare(
      `SELECT id, email, nome, livello, punti, coins, isSubscribed, 
              subscriptionExpiresAt, createdAt
       FROM studente WHERE id = ?`
    )
    .get(userId) as {
    id: number;
    email: string;
    nome: string;
    livello: number;
    punti: number;
    coins: number;
    isSubscribed: number;
    subscriptionExpiresAt: string | null;
    createdAt: string;
  } | undefined;

  if (!studente) {
    return NextResponse.json(
      { error: 'Utente non trovato' },
      { status: 404 }
    );
  }

  // Ottieni tutti gli appunti dell'utente
  const appunti = db
    .prepare(
      `SELECT id, titolo, contenuto, classeId, sharedAt, createdAt, updatedAt
       FROM appunto 
       WHERE studenteId = ?
       ORDER BY createdAt DESC`
    )
    .all(userId) as Array<{
    id: number;
    titolo: string;
    contenuto: string;
    classeId: number | null;
    sharedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;

  // Ottieni tutti i quiz dell'utente
  const quiz = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, lastScore, bestScore, 
              completedAttempts, createdAt
       FROM quiz 
       WHERE studenteId = ?
       ORDER BY createdAt DESC`
    )
    .all(userId) as Array<{
    id: number;
    titolo: string;
    difficolta: string;
    totalQuestions: number;
    lastScore: number | null;
    bestScore: number | null;
    completedAttempts: number;
    createdAt: string;
  }>;

  // Ottieni tutti i vero/falso dell'utente
  const veroFalso = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, lastScore, bestScore, 
              completedAttempts, createdAt
       FROM vero_falso 
       WHERE studenteId = ?
       ORDER BY createdAt DESC`
    )
    .all(userId) as Array<{
    id: number;
    titolo: string;
    difficolta: string;
    totalQuestions: number;
    lastScore: number | null;
    bestScore: number | null;
    completedAttempts: number;
    createdAt: string;
  }>;

  // Ottieni tutte le classi dell'utente
  const classi = db
    .prepare(
      `SELECT c.id, c.nome, c.codice, c.creatoreId, c.createdAt, sc.joinedAt
       FROM classe c
       INNER JOIN studente_classe sc ON c.id = sc.classeId
       WHERE sc.studenteId = ?
       ORDER BY sc.joinedAt DESC`
    )
    .all(userId) as Array<{
    id: number;
    nome: string;
    codice: string;
    creatoreId: number;
    createdAt: string;
    joinedAt: string;
  }>;

  return NextResponse.json({
    studente,
    appunti,
    quiz,
    veroFalso,
    classi,
  });
}

