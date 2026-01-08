import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();
  const profile = db
    .prepare(
      'SELECT id, email, nome, livello, punti, createdAt FROM studente WHERE id = ?'
    )
    .get(user.id);

  if (!profile) {
    return NextResponse.json(
      { error: 'Profilo non trovato' },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { nome } = await request.json();
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return NextResponse.json(
      { error: 'Il nome deve avere almeno 2 caratteri' },
      { status: 400 }
    );
  }

  const db = getDatabase();
  db.prepare('UPDATE studente SET nome = ? WHERE id = ?').run(
    nome.trim(),
    user.id
  );

  return NextResponse.json({ success: true, nome: nome.trim() });
}

export async function DELETE() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();
  const deleteStudent = db.transaction((studentId: number) => {
    db.prepare('DELETE FROM domanda_quiz WHERE quizId IN (SELECT id FROM quiz WHERE studenteId = ?)').run(studentId);
    db.prepare('DELETE FROM domanda_vero_falso WHERE veroFalsoId IN (SELECT id FROM vero_falso WHERE studenteId = ?)').run(studentId);
    db.prepare('DELETE FROM quiz WHERE studenteId = ?').run(studentId);
    db.prepare('DELETE FROM vero_falso WHERE studenteId = ?').run(studentId);
    db.prepare('DELETE FROM appunto WHERE studenteId = ?').run(studentId);
    db.prepare('DELETE FROM studente WHERE id = ?').run(studentId);
  });

  deleteStudent(user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}

