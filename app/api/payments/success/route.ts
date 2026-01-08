/**
 * API Route: GET /api/payments/success
 * Gestisce il successo del pagamento e aggiorna coin/abbonamento
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCT_PRICES } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { addCoins, activateSubscription } from '@/lib/coins';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const productType = searchParams.get('product_type');
    const userId = searchParams.get('user_id');

    console.log('🔍 Parametri ricevuti:', { sessionId, productType, userId });

    if (!sessionId || !productType || !userId) {
      console.error('❌ Parametri mancanti');
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    // Verifica la sessione Stripe
    console.log('🔍 Recupero sessione Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('✅ Sessione recuperata:', {
      id: session.id,
      payment_status: session.payment_status,
      mode: session.mode,
    });

    if (session.payment_status !== 'paid') {
      console.error('❌ Pagamento non completato:', session.payment_status);
      return NextResponse.json(
        { error: `Pagamento non completato. Status: ${session.payment_status}` },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const studenteId = parseInt(userId, 10);

    // Verifica che l'utente esista
    const studente = db
      .prepare('SELECT id FROM studente WHERE id = ?')
      .get(studenteId);

    if (!studente) {
      console.error('❌ Utente non trovato:', studenteId);
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    console.log('✅ Utente trovato:', studenteId);

    // Applica il prodotto acquistato
    if (productType.startsWith('COINS_')) {
      const product = PRODUCT_PRICES[productType as keyof typeof PRODUCT_PRICES];
      if (product && 'coins' in product) {
        console.log(`💰 Aggiungo ${product.coins} coin all'utente ${studenteId}`);
        addCoins(studenteId, product.coins);
      } else {
        console.error('❌ Prodotto coin non trovato:', productType);
      }
    } else if (productType.startsWith('SUBSCRIPTION_')) {
      const product = PRODUCT_PRICES[productType as keyof typeof PRODUCT_PRICES];
      if (product && 'months' in product) {
        console.log(`⭐ Attivo abbonamento di ${product.months} mesi per utente ${studenteId}`);
        activateSubscription(studenteId, product.months);
      } else {
        console.error('❌ Prodotto abbonamento non trovato:', productType);
      }
    } else {
      console.error('❌ Tipo prodotto non riconosciuto:', productType);
      return NextResponse.json(
        { error: 'Tipo prodotto non riconosciuto' },
        { status: 400 }
      );
    }

    console.log('✅ Pagamento elaborato con successo');

    // Redirect alla dashboard con messaggio di successo
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/dashboard?payment=success`);
  } catch (error: any) {
    console.error('❌ Errore gestione pagamento:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Errore elaborazione pagamento',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

