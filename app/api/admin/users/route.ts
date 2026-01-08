/**
 * API Route: GET /api/admin/users
 * Restituisce la lista di tutti gli utenti
 * Accessibile solo agli amministratori
 */

import { NextResponse } from 'next/server';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
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

  const db = getDatabase();

  // Ottieni tutti gli utenti con statistiche base
  const users = db
    .prepare(
      `SELECT 
        id, 
        email, 
        nome, 
        livello, 
        punti, 
        coins,
        isSubscribed,
        subscriptionExpiresAt,
        createdAt,
        (SELECT COUNT(*) FROM appunto WHERE studenteId = studente.id) as totalAppunti,
        (SELECT COUNT(*) FROM quiz WHERE studenteId = studente.id) as totalQuiz,
        (SELECT COUNT(*) FROM vero_falso WHERE studenteId = studente.id) as totalVeroFalso,
        (SELECT COUNT(*) FROM studente_classe WHERE studenteId = studente.id) as totalClassi
      FROM studente
      ORDER BY createdAt DESC`
    )
    .all() as Array<{
      id: number;
      email: string;
      nome: string;
      livello: number;
      punti: number;
      coins: number;
      isSubscribed: number;
      subscriptionExpiresAt: string | null;
      createdAt: string;
      totalAppunti: number;
      totalQuiz: number;
      totalVeroFalso: number;
      totalClassi: number;
    }>;

  return NextResponse.json({ users });
}

