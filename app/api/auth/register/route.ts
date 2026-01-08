/**
 * API Route: POST /api/auth/register
 * Gestisce la registrazione di nuovi studenti
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, nome, password } = await request.json();

    // Validazione input
    if (!email || !nome || !password) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatorii' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verifica se l'email esiste già
    const existing = db
      .prepare('SELECT id FROM studente WHERE email = ?')
      .get(email);

    if (existing) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 409 }
      );
    }

    // Hash della password
    const passwordHash = await bcrypt.hash(password, 10);

    // Coin di benvenuto per nuovi utenti
    const WELCOME_COINS = 50;

    // Inserisci nuovo studente con coin di benvenuto
    const result = db
      .prepare(
        'INSERT INTO studente (email, nome, password_hash, coins) VALUES (?, ?, ?, ?)'
      )
      .run(email, nome, passwordHash, WELCOME_COINS);

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata',
      studente: {
        id: result.lastInsertRowid,
        email,
        nome,
      },
    });
  } catch (error: any) {
    console.error('Errore registrazione:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

