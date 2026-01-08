import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Compila tutti i campi' },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: 'La nuova password deve avere almeno 6 caratteri' },
      { status: 400 }
    );
  }

  const db = getDatabase();
  const studente = db
    .prepare('SELECT password_hash FROM studente WHERE id = ?')
    .get(user.id) as { password_hash: string } | undefined;

  if (!studente) {
    return NextResponse.json(
      { error: 'Studente non trovato' },
      { status: 404 }
    );
  }

  const matches = await bcrypt.compare(currentPassword, studente.password_hash);
  if (!matches) {
    return NextResponse.json(
      { error: 'Password attuale non corretta' },
      { status: 401 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE studente SET password_hash = ? WHERE id = ?').run(
    hashed,
    user.id
  );

  return NextResponse.json({ success: true });
}

