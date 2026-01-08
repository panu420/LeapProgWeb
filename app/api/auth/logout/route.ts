/**
 * API Route: POST /api/auth/logout
 * Gestisce il logout degli studenti
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Rimuovi il cookie di autenticazione
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Scade immediatamente
  });

  return response;
}
