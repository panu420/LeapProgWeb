/**
 * Utility per gestire coin e abbonamenti
 * Logica di business per il sistema Freemium
 */

import { getDatabase } from './db';

// Costi in coin per le funzioni AI
export const AI_COSTS = {
  GENERATE_NOTE: 10, // Costo per generare un appunto con AI
  GENERATE_QUIZ: 5, // Costo per generare un quiz con AI
  GENERATE_VERO_FALSO: 5, // Costo per generare un vero/falso con AI
} as const;

// Coin di benvenuto per nuovi utenti
export const WELCOME_COINS = 50;

// Coin guadagnati completando missioni
// Le ricompense devono essere maggiori del costo necessario per completare la missione
// Costi: Quiz = 5 coin, Vero/Falso = 5 coin, Appunto AI = 10 coin
export const MISSION_COIN_REWARDS = {
  // Missioni semplici (1 quiz/vero-falso) - danno esattamente il costo
  quiz_1: 5, // 1 quiz = 5 coin necessari, ricompensa 5 coin
  vero_falso_1: 5, // 1 vero/falso = 5 coin necessari, ricompensa 5 coin
  
  // Missioni difficili (3 quiz/vero-falso) - danno più del costo necessario
  quiz_3: 20, // 3 quiz = 15 coin necessari, ricompensa 20 coin (profitto +5)
  vero_falso_3: 20, // 3 vero/falso = 15 coin necessari, ricompensa 20 coin (profitto +5)
  
  // Missioni appunti (gratuite se manuali, costose se AI)
  create_note: 3, // Può essere gratuito (manuale) o costare 10 coin (AI), ricompensa 3 coin
  edit_note: 2, // Gratuito, ricompensa 2 coin
  
  // Missioni punti (possono richiedere molti quiz/vero-falso)
  earn_50_points: 10, // Può richiedere ~5 quiz/vero-falso = 25 coin, ricompensa 10 coin
  earn_100_points: 30, // Può richiedere ~10 quiz/vero-falso = 50 coin, ricompensa 30 coin
} as const;

/**
 * Verifica se un utente ha un abbonamento attivo
 */
export function isSubscribed(studenteId: number): boolean {
  const db = getDatabase();
  const studente = db
    .prepare(
      'SELECT isSubscribed, subscriptionExpiresAt FROM studente WHERE id = ?'
    )
    .get(studenteId) as
    | { isSubscribed: number; subscriptionExpiresAt: string | null }
    | undefined;

  if (!studente) {
    return false;
  }

  // Se non è abbonato, ritorna false
  if (studente.isSubscribed === 0) {
    return false;
  }

  // Se ha una data di scadenza, controlla se è ancora valida
  if (studente.subscriptionExpiresAt) {
    const expiresAt = new Date(studente.subscriptionExpiresAt);
    const now = new Date();
    return expiresAt > now;
  }

  // Se è abbonato ma senza data di scadenza, considera attivo
  return true;
}

/**
 * Verifica se un utente può usare una funzione AI (ha abbonamento o coin sufficienti)
 */
export function canUseAI(
  studenteId: number,
  cost: number
): { canUse: boolean; reason?: string } {
  // Se ha abbonamento attivo, può usare tutto gratuitamente
  if (isSubscribed(studenteId)) {
    return { canUse: true };
  }

  // Altrimenti controlla i coin
  const db = getDatabase();
  const studente = db
    .prepare('SELECT coins FROM studente WHERE id = ?')
    .get(studenteId) as { coins: number } | undefined;

  if (!studente) {
    return { canUse: false, reason: 'Utente non trovato' };
  }

  if (studente.coins < cost) {
    return {
      canUse: false,
      reason: `Coin insufficienti. Necessari: ${cost}, disponibili: ${studente.coins}`,
    };
  }

  return { canUse: true };
}

/**
 * Deduce coin da un utente
 * Ritorna true se la deduzione è andata a buon fine, false altrimenti
 */
export function deductCoins(studenteId: number, amount: number): boolean {
  const db = getDatabase();
  const current = db
    .prepare('SELECT coins FROM studente WHERE id = ?')
    .get(studenteId) as { coins: number } | undefined;

  if (!current || current.coins < amount) {
    return false;
  }

  db.prepare('UPDATE studente SET coins = coins - ? WHERE id = ?').run(
    amount,
    studenteId
  );

  return true;
}

/**
 * Aggiunge coin a un utente
 */
export function addCoins(studenteId: number, amount: number): void {
  const db = getDatabase();
  db.prepare('UPDATE studente SET coins = coins + ? WHERE id = ?').run(
    amount,
    studenteId
  );
}

/**
 * Ottiene il saldo coin di un utente
 */
export function getCoins(studenteId: number): number {
  const db = getDatabase();
  const studente = db
    .prepare('SELECT coins FROM studente WHERE id = ?')
    .get(studenteId) as { coins: number } | undefined;

  return studente?.coins || 0;
}

/**
 * Attiva un abbonamento per un utente
 * @param studenteId ID dello studente
 * @param months Durata in mesi (1 o 12)
 */
export function activateSubscription(
  studenteId: number,
  months: number
): void {
  const db = getDatabase();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  db.prepare(
    'UPDATE studente SET isSubscribed = 1, subscriptionExpiresAt = ? WHERE id = ?'
  ).run(expiresAt.toISOString(), studenteId);
}

