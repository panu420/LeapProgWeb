/**
 * API Route: DELETE /api/admin/appunti/[id]
 * Elimina un appunto (solo per amministratori)
 * Utile per rimuovere contenuti inappropriati
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function DELETE(
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
  const appuntoId = Number(id);

  if (isNaN(appuntoId)) {
    return NextResponse.json(
      { error: 'ID appunto non valido' },
      { status: 400 }
    );
  }

  const db = getDatabase();

  // Verifica che l'appunto esista
  const appunto = db
    .prepare('SELECT id, titolo, studenteId FROM appunto WHERE id = ?')
    .get(appuntoId) as { id: number; titolo: string; studenteId: number } | undefined;

  if (!appunto) {
    return NextResponse.json(
      { error: 'Appunto non trovato' },
      { status: 404 }
    );
  }

  // Elimina l'appunto (SQLite gestisce automaticamente le foreign key se configurate)
  // Nota: questo eliminerà anche i quiz associati se ci sono vincoli CASCADE
  db.prepare('DELETE FROM appunto WHERE id = ?').run(appuntoId);

  return NextResponse.json({
    success: true,
    message: `Appunto "${appunto.titolo}" eliminato con successo`,
  });
}

