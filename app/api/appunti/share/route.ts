/**
 * API Route: POST /api/appunti/share
 * Condivide un appunto in una classe
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

    const { appuntoId, classeId } = await request.json();
    if (!appuntoId || !classeId) {
      return NextResponse.json(
        { error: 'appuntoId e classeId obbligatori' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verifica che l'appunto appartenga allo studente
    const appunto = db
      .prepare('SELECT id, studenteId FROM appunto WHERE id = ?')
      .get(appuntoId) as { id: number; studenteId: number } | undefined;

    if (!appunto || appunto.studenteId !== user.id) {
      return NextResponse.json(
        { error: 'Appunto non trovato o non autorizzato' },
        { status: 404 }
      );
    }

    // Verifica che lo studente appartenga alla classe
    const membership = db
      .prepare(
        'SELECT id FROM studente_classe WHERE studenteId = ? AND classeId = ?'
      )
      .get(user.id, classeId);

    if (!membership) {
      return NextResponse.json(
        { error: 'Non appartieni a questa classe' },
        { status: 403 }
      );
    }

    // Condividi appunto
    db.prepare(
      'UPDATE appunto SET classeId = ?, sharedAt = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(classeId, appuntoId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore condivisione appunto:', error);
    return NextResponse.json(
      { error: error.message || 'Errore nella condivisione' },
      { status: 500 }
    );
  }
}

