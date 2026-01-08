/**
 * API Route: GET/POST /api/classi
 * Gestisce lista e creazione di classi
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateClassCode } from '@/lib/class-code';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const db = getDatabase();

  // Recupera classi a cui lo studente appartiene
  const classi = db
    .prepare(
      `SELECT c.id, c.nome, c.codice, c.creatoreId, c.createdAt,
              CASE WHEN c.creatoreId = ? THEN 1 ELSE 0 END as isCreator
       FROM classe c
       INNER JOIN studente_classe sc ON c.id = sc.classeId
       WHERE sc.studenteId = ?
       ORDER BY c.createdAt DESC`
    )
    .all(user.id, user.id) as Array<{
    id: number;
    nome: string;
    codice: string;
    creatoreId: number;
    createdAt: string;
    isCreator: number;
  }>;

  return NextResponse.json({ classi });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { nome } = await request.json();
    if (!nome || nome.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome classe obbligatorio' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Genera codice univoco
    let codice: string;
    let exists: any;
    do {
      codice = generateClassCode();
      exists = db
        .prepare('SELECT id FROM classe WHERE codice = ?')
        .get(codice);
    } while (exists);

    // Crea classe
    const result = db
      .prepare(
        'INSERT INTO classe (nome, codice, creatoreId) VALUES (?, ?, ?)'
      )
      .run(nome.trim(), codice, user.id);

    const classeId = result.lastInsertRowid as number;

    // Aggiungi creatore alla classe
    db.prepare(
      'INSERT INTO studente_classe (studenteId, classeId) VALUES (?, ?)'
    ).run(user.id, classeId);

    // Recupera classe creata
    const classe = db
      .prepare('SELECT id, nome, codice, creatoreId, createdAt FROM classe WHERE id = ?')
      .get(classeId);

    return NextResponse.json({ classe });
  } catch (error: any) {
    console.error('Errore creazione classe:', error);
    return NextResponse.json(
      { error: error.message || 'Errore nella creazione' },
      { status: 500 }
    );
  }
}

