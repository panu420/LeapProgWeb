/**
 * Script di seeding per popolare il database con dati di test
 * Esegui con: npx tsx scripts/seed-database.ts
 * 
 * Popola il database con ~100 utenti e dati distribuiti nel tempo
 * Periodo di riferimento: 09/01/2026 - 13/01/2026
 */

import { getDatabase } from '../lib/db';
import bcrypt from 'bcryptjs';

// Prezzi prodotti (in centesimi di euro) - duplicati qui per evitare dipendenza da Stripe nel seed
const PRODUCT_PRICES = {
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

const db = getDatabase();

// Date di riferimento per il periodo di seed
const START_DATE = new Date('2026-01-09');
const END_DATE = new Date('2026-01-13');
const TODAY = END_DATE; // Data finale come riferimento
const SIX_MONTHS_AGO = new Date('2025-07-13');
const TWELVE_MONTHS_AGO = new Date('2025-01-13');

/**
 * Genera una data casuale tra startDate e endDate
 */
function randomDate(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

/**
 * Genera un nome casuale
 */
function randomName(): string {
  const nomi = [
    'Mario', 'Luigi', 'Giuseppe', 'Antonio', 'Francesco', 'Alessandro', 'Lorenzo',
    'Leonardo', 'Mattia', 'Andrea', 'Tommaso', 'Gabriele', 'Riccardo', 'Edoardo',
    'Lucia', 'Giulia', 'Sofia', 'Aurora', 'Alice', 'Ginevra', 'Emma', 'Giorgia',
    'Greta', 'Beatrice', 'Anna', 'Vittoria', 'Matilde', 'Noemi', 'Chloe', 'Ludovica'
  ];
  const cognomi = [
    'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo',
    'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa',
    'Fontana', 'Martinelli', 'Serra', 'Carbone', 'Moretti', 'Barbieri', 'Fontana',
    'Caruso', 'Mancini', 'Rizzo', 'Lombardi', 'Morelli', 'Galli', 'Ferrara', 'Marchetti'
  ];
  return `${nomi[Math.floor(Math.random() * nomi.length)]} ${cognomi[Math.floor(Math.random() * cognomi.length)]}`;
}

/**
 * Genera un email basata sul nome
 */
function generateEmail(nome: string, index: number): string {
  const nomeLower = nome.toLowerCase().replace(/\s+/g, '.');
  return `${nomeLower}${index > 0 ? index : ''}@email.com`;
}

/**
 * Genera un session ID Stripe fittizio ma realistico
 */
function generateStripeSessionId(): string {
  // Formato: cs_test_xxxxxxxxxxxxxxxxxxxxxx
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 24 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `cs_test_${randomPart}`;
}

/**
 * Funzione principale per popolare il database
 */
async function seedDatabase() {
  console.log('🌱 Inizio seeding del database...\n');
  console.log(`📅 Data di riferimento: ${TODAY.toLocaleDateString('it-IT')}\n`);

  // Hash password comune per tutti gli utenti di test
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Crea ~100 utenti (studenti)
  console.log('📝 Creazione utenti...');
  const studenti: Array<{
    email: string;
    nome: string;
    password_hash: string;
    livello: number;
    punti: number;
    isAdmin: number;
    coins: number;
    isSubscribed: number;
    subscriptionExpiresAt: string | null;
    createdAt: string;
  }> = [];

  // Admin (sempre presente) - con abbonamento attivo e molti coin
  studenti.push({
    email: 'admin@leapweb.com',
    nome: 'Admin CEO',
    password_hash: defaultPassword,
    livello: 10,
    punti: 5000,
    isAdmin: 1,
    coins: 1000,
    isSubscribed: 1,
    subscriptionExpiresAt: new Date('2026-01-13').toISOString(), // Abbonamento attivo fino al 2026
    createdAt: TWELVE_MONTHS_AGO.toISOString(),
  });

  // Genera ~99 utenti normali
  const totalUsers = 100;
  for (let i = 1; i < totalUsers; i++) {
    const nome = randomName();
    const email = generateEmail(nome, i);
    
    // Distribuzione livelli: più utenti ai livelli bassi
    let livello: number;
    const rand = Math.random();
    if (rand < 0.4) livello = 1; // 40% livello 1
    else if (rand < 0.65) livello = 2; // 25% livello 2
    else if (rand < 0.8) livello = 3; // 15% livello 3
    else if (rand < 0.9) livello = 4; // 10% livello 4
    else if (rand < 0.95) livello = 5; // 5% livello 5
    else if (rand < 0.98) livello = 6; // 3% livello 6
    else livello = Math.floor(Math.random() * 3) + 7; // 2% livello 7-9

    // Punti basati sul livello (con variazione)
    const puntiBase = livello * 400;
    const punti = puntiBase + Math.floor(Math.random() * 600);

    // Data di registrazione distribuita negli ultimi 12 mesi
    const createdAt = randomDate(TWELVE_MONTHS_AGO, TODAY);

    // Distribuzione coin: alcuni con molti, alcuni con pochi
    let coins: number;
    const coinRand = Math.random();
    if (coinRand < 0.3) coins = 0; // 30% senza coin
    else if (coinRand < 0.5) coins = Math.floor(Math.random() * 50) + 10; // 20% con 10-60 coin
    else if (coinRand < 0.7) coins = Math.floor(Math.random() * 100) + 50; // 20% con 50-150 coin
    else if (coinRand < 0.85) coins = Math.floor(Math.random() * 200) + 150; // 15% con 150-350 coin
    else if (coinRand < 0.95) coins = Math.floor(Math.random() * 300) + 300; // 10% con 300-600 coin
    else coins = Math.floor(Math.random() * 500) + 500; // 5% con 500-1000 coin

    // Distribuzione abbonamenti:
    // - 15% con abbonamento attivo
    // - 5% con abbonamento scaduto
    // - 80% senza abbonamento
    let isSubscribed = 0;
    let subscriptionExpiresAt: string | null = null;
    const subRand = Math.random();
    
    if (subRand < 0.15) {
      // Abbonamento attivo (mensile o annuale)
      isSubscribed = 1;
      const months = Math.random() < 0.5 ? 1 : 12; // 50% mensile, 50% annuale
      const expiresDate = new Date(TODAY);
      expiresDate.setMonth(expiresDate.getMonth() + months);
      subscriptionExpiresAt = expiresDate.toISOString();
      // Gli abbonati hanno meno coin (non li usano)
      coins = Math.floor(Math.random() * 100);
    } else if (subRand < 0.20) {
      // Abbonamento scaduto (scaduto 1-6 mesi fa)
      isSubscribed = 1;
      const monthsAgo = Math.floor(Math.random() * 6) + 1;
      const expiresDate = new Date(TODAY);
      expiresDate.setMonth(expiresDate.getMonth() - monthsAgo);
      subscriptionExpiresAt = expiresDate.toISOString();
    }

    studenti.push({
      email,
      nome,
      password_hash: defaultPassword,
      livello,
      punti,
      isAdmin: 0,
      coins,
      isSubscribed,
      subscriptionExpiresAt,
      createdAt,
    });
  }

  const studenteIds: number[] = [];
  const userIdToCreatedAt = new Map<number, string>(); // Mapping userId -> createdAt

  for (const studente of studenti) {
    // Verifica se esiste già
    const existing = db
      .prepare('SELECT id FROM studente WHERE email = ?')
      .get(studente.email) as { id: number } | undefined;

    if (existing) {
      // Aggiorna se esiste
      db.prepare(
        `UPDATE studente 
         SET nome = ?, password_hash = ?, livello = ?, punti = ?, isAdmin = ?, 
             coins = ?, isSubscribed = ?, subscriptionExpiresAt = ?, createdAt = ? 
         WHERE email = ?`
      ).run(
        studente.nome,
        studente.password_hash,
        studente.livello,
        studente.punti,
        studente.isAdmin,
        studente.coins,
        studente.isSubscribed,
        studente.subscriptionExpiresAt,
        studente.createdAt,
        studente.email
      );
      studenteIds.push(existing.id);
      userIdToCreatedAt.set(existing.id, studente.createdAt);
    } else {
      // Inserisci nuovo
      const result = db
        .prepare(
          `INSERT INTO studente (email, nome, password_hash, livello, punti, isAdmin, 
                                  coins, isSubscribed, subscriptionExpiresAt, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          studente.email,
          studente.nome,
          studente.password_hash,
          studente.livello,
          studente.punti,
          studente.isAdmin,
          studente.coins,
          studente.isSubscribed,
          studente.subscriptionExpiresAt,
          studente.createdAt
        );
      const newId = result.lastInsertRowid as number;
      studenteIds.push(newId);
      userIdToCreatedAt.set(newId, studente.createdAt);
    }
  }
  console.log(`  ✓ Creati/Aggiornati ${studenteIds.length} utenti`);

  const adminId = studenteIds[0]; // Admin è il primo
  const userIds = studenteIds.slice(1); // Altri utenti

  // 2. Crea classi (distribuite nel tempo)
  console.log('\n🏫 Creazione classi...');
  const classiNomi = [
    'Matematica Avanzata', 'Programmazione Web', 'Fisica Quantistica',
    'Storia Moderna', 'Letteratura Italiana', 'Chimica Organica',
    'Biologia Molecolare', 'Economia Aziendale', 'Psicologia Cognitiva',
    'Architettura Software', 'Machine Learning', 'Database Systems'
  ];

  const classeIds: number[] = [];
  for (let i = 0; i < classiNomi.length; i++) {
    const codice = `${classiNomi[i].substring(0, 4).toUpperCase()}${2025 + (i % 2)}`;
    const createdAt = randomDate(TWELVE_MONTHS_AGO, SIX_MONTHS_AGO); // Classi create nei primi 6 mesi

    const existing = db
      .prepare('SELECT id FROM classe WHERE codice = ?')
      .get(codice) as { id: number } | undefined;

    if (existing) {
      classeIds.push(existing.id);
    } else {
      const result = db
        .prepare(
          'INSERT INTO classe (nome, codice, creatoreId, createdAt) VALUES (?, ?, ?, ?)'
        )
        .run(classiNomi[i], codice, adminId, createdAt);
      classeIds.push(result.lastInsertRowid as number);
    }
  }
  console.log(`  ✓ Create ${classeIds.length} classi`);

  // 3. Aggiungi studenti alle classi (distribuiti nel tempo)
  console.log('\n👥 Aggiunta studenti alle classi...');
  let totalMemberships = 0;
  for (const classeId of classeIds) {
    // 30-70% degli utenti in ogni classe
    const numMembers = Math.floor(userIds.length * (0.3 + Math.random() * 0.4));
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    const studentiInClasse = shuffled.slice(0, numMembers);

    for (const studenteId of studentiInClasse) {
      const joinedAt = randomDate(
        new Date('2025-07-13'), // Dopo la creazione delle classi
        TODAY
      );
      try {
        db.prepare(
          'INSERT OR IGNORE INTO studente_classe (studenteId, classeId, joinedAt) VALUES (?, ?, ?)'
        ).run(studenteId, classeId, joinedAt);
        totalMemberships++;
      } catch (e) {
        // Ignora duplicati
      }
    }
  }
  console.log(`  ✓ ${totalMemberships} iscrizioni a classi`);

  // 4. Crea appunti (distribuiti nel tempo, solo per utenti attivi)
  console.log('\n📚 Creazione appunti...');
  const appuntiTitoli = [
    'Introduzione a React', 'Hooks in React', 'Next.js App Router', 'SQLite Database',
    'Teoria dei Numeri', 'Calcolo Differenziale', 'Meccanica Quantistica', 'Relatività Ristretta',
    'Storia del Rinascimento', 'Dante Alighieri', 'Reazioni Organiche', 'DNA e RNA',
    'Microeconomia', 'Memoria e Apprendimento', 'Design Patterns', 'Neural Networks',
    'SQL Avanzato', 'Algoritmi di Ordinamento', 'Fisica Nucleare', 'Chimica Inorganica',
    'Letteratura Contemporanea', 'Storia Antica', 'Biologia Cellulare', 'Psicologia Sociale'
  ];

  const appuntoIds: number[] = [];
  // Solo ~40% degli utenti crea appunti
  const utentiAttivi = userIds.slice(0, Math.floor(userIds.length * 0.4));
  const numAppunti = Math.floor(utentiAttivi.length * (2 + Math.random() * 3)); // 2-5 appunti per utente attivo

  for (let i = 0; i < numAppunti; i++) {
    const studenteId = utentiAttivi[Math.floor(Math.random() * utentiAttivi.length)];
    const titolo = appuntiTitoli[Math.floor(Math.random() * appuntiTitoli.length)];
    const contenuto = `# ${titolo}\n\nContenuto dell'appunto su ${titolo.toLowerCase()}.`;
    const studentCreatedAt = userIdToCreatedAt.get(studenteId) || TWELVE_MONTHS_AGO.toISOString();
    const createdAt = randomDate(new Date(studentCreatedAt), TODAY);

    const result = db
      .prepare(
        'INSERT INTO appunto (studenteId, titolo, contenuto, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
      )
      .run(studenteId, titolo, contenuto, createdAt, createdAt);
    appuntoIds.push(result.lastInsertRowid as number);
  }
  console.log(`  ✓ Creati ${appuntoIds.length} appunti`);

  // 5. Condividi alcuni appunti nelle classi
  console.log('\n🔗 Condivisione appunti nelle classi...');
  const numShared = Math.floor(appuntoIds.length * 0.3); // 30% degli appunti condivisi
  const shuffledAppunti = [...appuntoIds].sort(() => Math.random() - 0.5);
  
    for (let i = 0; i < numShared; i++) {
    const appuntoId = shuffledAppunti[i];
    const classeId = classeIds[Math.floor(Math.random() * classeIds.length)];
    const sharedAt = randomDate(
      new Date('2025-08-13'),
      TODAY
    );

    db.prepare(
      'UPDATE appunto SET classeId = ?, sharedAt = ? WHERE id = ?'
    ).run(classeId, sharedAt, appuntoId);
  }
  console.log(`  ✓ Condivisi ${numShared} appunti`);

  // 6. Crea quiz (solo per ~30% degli utenti)
  console.log('\n❓ Creazione quiz...');
  const quizIds: number[] = [];
  const utentiConQuiz = utentiAttivi.slice(0, Math.floor(utentiAttivi.length * 0.75));
  const numQuiz = Math.floor(utentiConQuiz.length * (1 + Math.random() * 2)); // 1-3 quiz per utente

  for (let i = 0; i < numQuiz; i++) {
    const studenteId = utentiConQuiz[Math.floor(Math.random() * utentiConQuiz.length)];
    const appuntoId = appuntoIds.length > 0 && Math.random() > 0.5 
      ? appuntoIds[Math.floor(Math.random() * appuntoIds.length)] 
      : null;
    
    const difficolta = ['facile', 'media', 'difficile'][Math.floor(Math.random() * 3)];
    const totalQuestions = 5;
    
    // Solo ~60% dei quiz sono completati
    const isCompleted = Math.random() < 0.6;
    const completedAttempts = isCompleted ? Math.floor(Math.random() * 3) + 1 : 0;
    const lastScore = isCompleted ? Math.floor(Math.random() * 40) + 60 : null;
    const bestScore = isCompleted ? (lastScore! + Math.floor(Math.random() * 20)) : null;
    const lastCompletedAt = isCompleted 
      ? randomDate(new Date('2025-08-13'), TODAY) 
      : null;

    const studentCreatedAt = userIdToCreatedAt.get(studenteId) || TWELVE_MONTHS_AGO.toISOString();
    const createdAt = randomDate(new Date(studentCreatedAt), TODAY);

    const result = db
      .prepare(
        `INSERT INTO quiz (studenteId, appuntoId, titolo, difficolta, totalQuestions, 
                          lastScore, bestScore, completedAttempts, lastCompletedAt, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        studenteId,
        appuntoId,
        `Quiz ${i + 1}`,
        difficolta,
        totalQuestions,
        lastScore,
        bestScore,
        completedAttempts,
        lastCompletedAt,
        createdAt
      );
    quizIds.push(result.lastInsertRowid as number);
  }
  console.log(`  ✓ Creati ${quizIds.length} quiz`);

  // 7. Crea vero/falso (solo per ~25% degli utenti)
  console.log('\n✅ Creazione esercizi Vero/Falso...');
  const veroFalsoIds: number[] = [];
  const utentiConVF = utentiAttivi.slice(0, Math.floor(utentiAttivi.length * 0.6));
  const numVF = Math.floor(utentiConVF.length * (0.5 + Math.random() * 1.5)); // 0.5-2 VF per utente

  for (let i = 0; i < numVF; i++) {
    const studenteId = utentiConVF[Math.floor(Math.random() * utentiConVF.length)];
    const appuntoId = appuntoIds.length > 0 && Math.random() > 0.5 
      ? appuntoIds[Math.floor(Math.random() * appuntoIds.length)] 
      : null;
    
    const difficolta = ['facile', 'media', 'difficile'][Math.floor(Math.random() * 3)];
    const totalQuestions = 5;
    
    const isCompleted = Math.random() < 0.55;
    const completedAttempts = isCompleted ? Math.floor(Math.random() * 3) + 1 : 0;
    const lastScore = isCompleted ? Math.floor(Math.random() * 40) + 60 : null;
    const bestScore = isCompleted ? (lastScore! + Math.floor(Math.random() * 20)) : null;
    const lastCompletedAt = isCompleted 
      ? randomDate(new Date('2025-08-13'), TODAY) 
      : null;

    const studentCreatedAt = userIdToCreatedAt.get(studenteId) || TWELVE_MONTHS_AGO.toISOString();
    const createdAt = randomDate(new Date(studentCreatedAt), TODAY);

    const result = db
      .prepare(
        `INSERT INTO vero_falso (studenteId, appuntoId, titolo, difficolta, totalQuestions, 
                                 lastScore, bestScore, completedAttempts, lastCompletedAt, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        studenteId,
        appuntoId,
        `Vero/Falso ${i + 1}`,
        difficolta,
        totalQuestions,
        lastScore,
        bestScore,
        completedAttempts,
        lastCompletedAt,
        createdAt
      );
    veroFalsoIds.push(result.lastInsertRowid as number);
  }
  console.log(`  ✓ Creati ${veroFalsoIds.length} esercizi Vero/Falso`);

  // 8. Crea missioni completate (distribuite nel tempo)
  console.log('\n🎯 Creazione missioni completate...');
  const missioniTypes = ['complete_quiz', 'complete_vero_falso', 'create_note', 'edit_note'];
  const numMissions = Math.floor(userIds.length * 2.5); // ~2.5 missioni per utente in media

  let missioniCount = 0;
  for (let i = 0; i < numMissions; i++) {
    const studenteId = userIds[Math.floor(Math.random() * userIds.length)];
    const missioneId = missioniTypes[Math.floor(Math.random() * missioniTypes.length)];
    
    // Distribuisci missioni negli ultimi 3 mesi
    const missionDate = randomDate(new Date('2025-10-13'), TODAY);
    const dateStr = missionDate.split('T')[0];

    try {
      db.prepare(
        `INSERT OR IGNORE INTO missione_completata (studenteId, missioneId, dataCompletamento) 
         VALUES (?, ?, ?)`
      ).run(studenteId, missioneId, dateStr);
      missioniCount++;
    } catch (e) {
      // Ignora duplicati
    }
  }
  console.log(`  ✓ Registrate ${missioniCount} missioni completate`);

  // Statistiche monetizzazione
  const totalCoins = db.prepare('SELECT SUM(coins) as total FROM studente').get() as { total: number | null };
  const subscribedActive = db.prepare(
    `SELECT COUNT(*) as count FROM studente 
     WHERE isSubscribed = 1 
     AND (subscriptionExpiresAt IS NULL OR subscriptionExpiresAt > datetime('now'))`
  ).get() as { count: number };
  const subscribedTotal = db.prepare('SELECT COUNT(*) as count FROM studente WHERE isSubscribed = 1').get() as { count: number };

  // 9. Crea acquisti (distribuiti tra 09/01/2026 e 13/01/2026)
  console.log('\n🛒 Creazione acquisti...');
  const productTypes = Object.keys(PRODUCT_PRICES) as Array<keyof typeof PRODUCT_PRICES>;
  // ~30% degli utenti ha fatto almeno un acquisto
  const utentiConAcquisti = userIds.slice(0, Math.floor(userIds.length * 0.3));
  const numAcquisti = Math.floor(utentiConAcquisti.length * (1 + Math.random() * 1.5)); // 1-2.5 acquisti per utente

  let acquistiCount = 0;
  for (let i = 0; i < numAcquisti; i++) {
    const studenteId = utentiConAcquisti[Math.floor(Math.random() * utentiConAcquisti.length)];
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    const product = PRODUCT_PRICES[productType];
    
    // Data acquisto distribuita tra START_DATE e END_DATE
    const createdAt = randomDate(START_DATE, END_DATE);
    
    // Determina coinsAggiunti e mesiAbbonamento in base al tipo prodotto
    let coinsAggiunti: number | null = null;
    let mesiAbbonamento: number | null = null;
    
    if (productType.startsWith('COINS_')) {
      coinsAggiunti = 'coins' in product ? product.coins : null;
    } else if (productType.startsWith('SUBSCRIPTION_')) {
      mesiAbbonamento = 'months' in product ? product.months : null;
    }
    
    const stripeSessionId = generateStripeSessionId();
    
    try {
      db.prepare(
        `INSERT INTO acquisto (
          studenteId, tipoProdotto, nomeProdotto, importo, importoEuro, 
          stripeSessionId, coinsAggiunti, mesiAbbonamento, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        studenteId,
        productType,
        product.name,
        product.amount,
        product.amount / 100, // Converti centesimi in euro
        stripeSessionId,
        coinsAggiunti,
        mesiAbbonamento,
        createdAt
      );
      acquistiCount++;
    } catch (e) {
      console.error(`Errore inserimento acquisto: ${e}`);
    }
  }
  console.log(`  ✓ Creati ${acquistiCount} acquisti`);

  // 10. Aggiorna dati utenti con date nel periodo 09-13 gennaio 2026
  console.log('\n📅 Aggiornamento date utenti nel periodo 09-13 gennaio 2026...');
  let updatedUsers = 0;
  for (const userId of userIds) {
    // Aggiorna createdAt per alcuni utenti nel periodo specificato
    if (Math.random() < 0.4) { // 40% degli utenti con data nel periodo
      const newCreatedAt = randomDate(START_DATE, END_DATE);
      db.prepare('UPDATE studente SET createdAt = ? WHERE id = ?').run(newCreatedAt, userId);
      updatedUsers++;
    }
  }
  console.log(`  ✓ Aggiornate date per ${updatedUsers} utenti`);

  console.log('\n✅ Seeding completato con successo!');
  console.log('\n📊 Riepilogo:');
  console.log(`  - ${studenteIds.length} utenti creati`);
  console.log(`  - ${classeIds.length} classi create`);
  console.log(`  - ${totalMemberships} iscrizioni a classi`);
  console.log(`  - ${appuntoIds.length} appunti creati`);
  console.log(`  - ${numShared} appunti condivisi`);
  console.log(`  - ${quizIds.length} quiz creati`);
  console.log(`  - ${veroFalsoIds.length} esercizi Vero/Falso creati`);
  console.log(`  - ${missioniCount} missioni completate`);
  console.log(`  - ${acquistiCount} acquisti creati`);
  console.log('\n💰 Monetizzazione:');
  console.log(`  - ${totalCoins.total || 0} coin totali nel sistema`);
  console.log(`  - ${subscribedActive.count} utenti con abbonamento attivo`);
  console.log(`  - ${subscribedTotal.count} utenti che hanno fatto abbonamento`);
  
  // Statistiche acquisti
  const totalAcquisti = db.prepare('SELECT COUNT(*) as count FROM acquisto').get() as { count: number };
  const totaleRicavi = db.prepare('SELECT SUM(importoEuro) as total FROM acquisto').get() as { total: number | null };
  console.log(`  - ${totalAcquisti.count} acquisti totali registrati`);
  console.log(`  - €${(totaleRicavi.total || 0).toFixed(2)} ricavi totali da acquisti`);
}

// Esegui lo script
seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore durante il seeding:', error);
    process.exit(1);
  });
