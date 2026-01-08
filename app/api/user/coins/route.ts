/**
 * API Route: GET /api/user/coins
 * Ottiene il saldo coin e lo stato abbonamento dell'utente autenticato
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCoins, isSubscribed } from '@/lib/coins';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const coins = getCoins(user.id);
    const subscribed = isSubscribed(user.id);

    return NextResponse.json({ coins, subscribed });
  } catch (error: any) {
    console.error('Errore recupero coin:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}

