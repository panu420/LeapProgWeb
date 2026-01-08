/**
 * Configurazione Stripe per pagamenti
 * Usa test mode per demo
 */

import Stripe from 'stripe';

/**
 * Chiave API Stripe Secret (test mode)
 * Deve essere impostata nella variabile d'ambiente STRIPE_SECRET_KEY
 * @throws Error se la chiave non è configurata
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY non configurata. Aggiungi la variabile d\'ambiente nel file .env'
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

// Prezzi prodotti (in centesimi di euro)
export const PRODUCT_PRICES = {
  COINS_100: {
    amount: 299, // 2.99€
    coins: 100,
    name: 'Pacchetto 100 Coin',
  },
  COINS_250: {
    amount: 699, // 6.99€
    coins: 250,
    name: 'Pacchetto 250 Coin',
  },
  COINS_500: {
    amount: 1299, // 12.99€
    coins: 500,
    name: 'Pacchetto 500 Coin',
  },
  SUBSCRIPTION_MONTHLY: {
    amount: 800, // 8.00€
    months: 1,
    name: 'Abbonamento Mensile',
  },
  SUBSCRIPTION_YEARLY: {
    amount: 7900, // 79.00€
    months: 12,
    name: 'Abbonamento Annuale',
  },
} as const;

