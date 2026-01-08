/**
 * API Route: POST /api/classi/join
 * Permette a uno studente di unirsi a una classe tramite codice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { codice } = await request.json();
    if (!codice || codice.trim().length === 0) {
      return NextResponse.json(
        { error: 'Codice classe obbligatorio' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Trova classe per codice
    const classe = db
      .prepare('SELECT id, nome, codice FROM classe WHERE codice = ?')
      .get(codice.trim().toUpperCase()) as
      | { id: number; nome: string; codice: string }
      | undefined;

    if (!classe) {
      return NextResponse.json(
        { error: 'Classe non trovata' },
        { status: 404 }
      );
    }

    // Verifica se già iscritto
    const existing = db
      .prepare(
        'SELECT id FROM studente_classe WHERE studenteId = ? AND classeId = ?'
      )
      .get(user.id, classe.id);

    if (existing) {
      return NextResponse.json(
        { error: 'Sei già iscritto a questa classe' },
        { status: 400 }
      );
    }

    // Aggiungi studente alla classe
    db.prepare(
      'INSERT INTO studente_classe (studenteId, classeId) VALUES (?, ?)'
    ).run(user.id, classe.id);

    return NextResponse.json({ classe });
  } catch (error: any) {
    console.error('Errore unione classe:', error);
    return NextResponse.json(
      { error: error.message || 'Errore nell\'unione' },
      { status: 500 }
    );
  }
}

