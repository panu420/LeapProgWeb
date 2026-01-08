/**
 * API Route: POST /api/payments/create-checkout
 * Crea una sessione di checkout Stripe per acquisto coin o abbonamento
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { stripe, PRODUCT_PRICES } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { productType } = body; // 'coins_100', 'coins_250', 'coins_500', 'subscription_monthly', 'subscription_yearly'

    if (!productType || !(productType in PRODUCT_PRICES)) {
      return NextResponse.json(
        { error: 'Tipo prodotto non valido' },
        { status: 400 }
      );
    }

    const product = PRODUCT_PRICES[productType as keyof typeof PRODUCT_PRICES];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Crea sessione checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: productType.startsWith('subscription') ? 'payment' : 'payment', // Stripe non supporta subscription mode in test senza setup completo
      success_url: `${baseUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&product_type=${productType}&user_id=${user.id}`,
      cancel_url: `${baseUrl}/dashboard`, // Redirect alla dashboard se l'utente annulla il pagamento
      metadata: {
        userId: user.id.toString(),
        productType,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Errore creazione checkout:', error);
    return NextResponse.json(
      { error: 'Errore creazione pagamento' },
      { status: 500 }
    );
  }
}

