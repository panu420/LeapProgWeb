/**
 * API Route: POST /api/auth/login
 * Gestisce il login degli studenti
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Secret per JWT (in produzione usare variabile d'ambiente)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'leap-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validazione input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatorie' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Cerca lo studente per email
    const studente = db
      .prepare('SELECT * FROM studente WHERE email = ?')
      .get(email) as any;

    if (!studente) {
      return NextResponse.json(
        { error: 'Email o password non corretti' },
        { status: 401 }
      );
    }

    // Verifica password
    const passwordMatch = await bcrypt.compare(password, studente.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email o password non corretti' },
        { status: 401 }
      );
    }

    // Crea JWT token
    const token = await new SignJWT({
      id: studente.id,
      email: studente.email,
      nome: studente.nome,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Ritorna successo con token
    const response = NextResponse.json({
      success: true,
      studente: {
        id: studente.id,
        email: studente.email,
        nome: studente.nome,
      },
    });

    // Imposta cookie con il token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 giorni
    });

    return response;
  } catch (error: any) {
    console.error('Errore login:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

