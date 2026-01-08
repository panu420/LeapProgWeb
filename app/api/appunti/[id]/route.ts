import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();
  const note = db
    .prepare(
      'SELECT id, studenteId, titolo, contenuto, createdAt, updatedAt FROM appunto WHERE id = ? AND studenteId = ?',
    )
    .get(Number(id), user.id);

  if (!note) {
    return NextResponse.json({ error: 'Appunto non trovato' }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { titolo, contenuto } = body;

  if (!titolo || !contenuto) {
    return NextResponse.json(
      { error: 'Titolo e contenuto obbligatori' },
      { status: 400 },
    );
  }

  const db = getDatabase();
  const result = db
    .prepare(
      `UPDATE appunto
       SET titolo = ?, contenuto = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND studenteId = ?`,
    )
    .run(titolo, contenuto, Number(id), user.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Appunto non trovato' }, { status: 404 });
  }

  const note = db
    .prepare(
      'SELECT id, studenteId, titolo, contenuto, createdAt, updatedAt FROM appunto WHERE id = ?',
    )
    .get(Number(id));

  return NextResponse.json({ note });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();
  const result = db
    .prepare('DELETE FROM appunto WHERE id = ? AND studenteId = ?')
    .run(Number(id), user.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Appunto non trovato' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

