/**
 * Database SQLite - Configurazione e inizializzazione
 * Gestisce la connessione al database e lo schema iniziale
 */

import Database from 'better-sqlite3';
import path from 'path';

// Path del database (nella root del progetto)
const dbPath = path.join(process.cwd(), 'database.db');

// Crea la connessione al database
let db: Database.Database | null = null;

/**
 * Ottiene o crea la connessione al database
 * Singleton pattern per evitare multiple connessioni
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON'); // Abilita foreign keys in SQLite
    initializeDatabase(db);
  }
  return db;
}

/**
 * Inizializza il database creando tutte le tabelle se non esistono
 */
function initializeDatabase(database: Database.Database): void {
  // Tabella STUDENTE
  database.exec(`
    CREATE TABLE IF NOT EXISTS studente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      nome VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      livello INTEGER NOT NULL DEFAULT 1,
      punti INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn(database, 'studente', 'livello', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(database, 'studente', 'punti', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(database, 'studente', 'isAdmin', 'INTEGER NOT NULL DEFAULT 0'); // 0 = false, 1 = true
  
  // Campi monetizzazione Freemium
  ensureColumn(database, 'studente', 'coins', 'INTEGER NOT NULL DEFAULT 0'); // Coin disponibili
  ensureColumn(database, 'studente', 'isSubscribed', 'INTEGER NOT NULL DEFAULT 0'); // 0 = false, 1 = true
  ensureColumn(database, 'studente', 'subscriptionExpiresAt', 'DATETIME NULL'); // Data scadenza abbonamento
  
  // Aggiorna utenti esistenti con coin di benvenuto se non hanno ancora coin
  updateExistingUsersWithWelcomeCoins(database);

  // Tabella APPUNTO
  database.exec(`
    CREATE TABLE IF NOT EXISTS appunto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studenteId INTEGER NOT NULL,
      titolo VARCHAR(255) NOT NULL,
      contenuto TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE RESTRICT
    );
  `);

  // Indice per ottimizzare le query su studenteId
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_appunto_studenteId ON appunto(studenteId);
  `);

  // Tabella QUIZ
  database.exec(`
    CREATE TABLE IF NOT EXISTS quiz (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appuntoId INTEGER NULL,
      studenteId INTEGER NOT NULL,
      titolo VARCHAR(255) NOT NULL,
      difficolta VARCHAR(50) DEFAULT 'media',
      totalQuestions INTEGER NOT NULL DEFAULT 5,
      lastScore INTEGER,
      bestScore INTEGER,
      completedAttempts INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appuntoId) REFERENCES appunto(id) ON DELETE SET NULL,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE RESTRICT
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_quiz_studenteId ON quiz(studenteId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_quiz_appuntoId ON quiz(appuntoId);
  `);

  ensureColumn(database, 'quiz', 'totalQuestions', 'INTEGER NOT NULL DEFAULT 5');
  ensureColumn(database, 'quiz', 'lastScore', 'INTEGER');
  ensureColumn(database, 'quiz', 'bestScore', 'INTEGER');
  ensureColumn(database, 'quiz', 'completedAttempts', 'INTEGER NOT NULL DEFAULT 0');

  // Tabella DOMANDA_QUIZ
  database.exec(`
    CREATE TABLE IF NOT EXISTS domanda_quiz (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER NOT NULL,
      domanda TEXT NOT NULL,
      opzione1 VARCHAR(255) NOT NULL,
      opzione2 VARCHAR(255) NOT NULL,
      opzione3 VARCHAR(255) NOT NULL,
      opzione4 VARCHAR(255) NOT NULL,
      rispostaCorretta INTEGER NOT NULL CHECK(rispostaCorretta BETWEEN 1 AND 4),
      ordine INTEGER NOT NULL,
      FOREIGN KEY (quizId) REFERENCES quiz(id) ON DELETE CASCADE,
      UNIQUE(quizId, ordine)
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_domanda_quiz_quizId ON domanda_quiz(quizId);
  `);

  // Tabella VERO_FALSO
  database.exec(`
    CREATE TABLE IF NOT EXISTS vero_falso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appuntoId INTEGER NULL,
      studenteId INTEGER NOT NULL,
      titolo VARCHAR(255) NOT NULL,
      difficolta VARCHAR(50) DEFAULT 'media',
      totalQuestions INTEGER NOT NULL DEFAULT 5,
      lastScore INTEGER,
      bestScore INTEGER,
      completedAttempts INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appuntoId) REFERENCES appunto(id) ON DELETE SET NULL,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE RESTRICT
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_vero_falso_studenteId ON vero_falso(studenteId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_vero_falso_appuntoId ON vero_falso(appuntoId);
  `);

  ensureColumn(database, 'vero_falso', 'totalQuestions', 'INTEGER NOT NULL DEFAULT 5');
  ensureColumn(database, 'vero_falso', 'lastScore', 'INTEGER');
  ensureColumn(database, 'vero_falso', 'bestScore', 'INTEGER');
  ensureColumn(database, 'vero_falso', 'completedAttempts', 'INTEGER NOT NULL DEFAULT 0');
  
  // Aggiungi lastCompletedAt per tracciare quando quiz/vero-falso sono stati completati
  ensureColumn(database, 'quiz', 'lastCompletedAt', 'DATETIME');
  ensureColumn(database, 'vero_falso', 'lastCompletedAt', 'DATETIME');

  // Tabella DOMANDA_VERO_FALSO
  database.exec(`
    CREATE TABLE IF NOT EXISTS domanda_vero_falso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      veroFalsoId INTEGER NOT NULL,
      affermazione TEXT NOT NULL,
      rispostaCorretta INTEGER NOT NULL CHECK(rispostaCorretta IN (0, 1)),
      ordine INTEGER NOT NULL,
      FOREIGN KEY (veroFalsoId) REFERENCES vero_falso(id) ON DELETE CASCADE,
      UNIQUE(veroFalsoId, ordine)
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_domanda_vero_falso_veroFalsoId ON domanda_vero_falso(veroFalsoId);
  `);

  // Tabella MISSIONE_COMPLETATA
  database.exec(`
    CREATE TABLE IF NOT EXISTS missione_completata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studenteId INTEGER NOT NULL,
      missioneId VARCHAR(50) NOT NULL,
      dataCompletamento DATE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE CASCADE,
      UNIQUE(studenteId, missioneId, dataCompletamento)
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_missione_completata_studenteId ON missione_completata(studenteId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_missione_completata_data ON missione_completata(dataCompletamento);
  `);

  // Tabella CLASSE
  database.exec(`
    CREATE TABLE IF NOT EXISTS classe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(255) NOT NULL,
      codice VARCHAR(10) UNIQUE NOT NULL,
      creatoreId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creatoreId) REFERENCES studente(id) ON DELETE RESTRICT
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_classe_creatoreId ON classe(creatoreId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_classe_codice ON classe(codice);
  `);

  // Tabella STUDENTE_CLASSE (relazione molti-a-molti)
  database.exec(`
    CREATE TABLE IF NOT EXISTS studente_classe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studenteId INTEGER NOT NULL,
      classeId INTEGER NOT NULL,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE CASCADE,
      FOREIGN KEY (classeId) REFERENCES classe(id) ON DELETE CASCADE,
      UNIQUE(studenteId, classeId)
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_studente_classe_studenteId ON studente_classe(studenteId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_studente_classe_classeId ON studente_classe(classeId);
  `);

  // Aggiungi colonna classeId alla tabella appunto per condivisione
  ensureColumn(database, 'appunto', 'classeId', 'INTEGER NULL');
  ensureColumn(database, 'appunto', 'sharedAt', 'DATETIME NULL');

  // Aggiungi foreign key per classeId in appunto se non esiste
  // SQLite non supporta ALTER TABLE ADD FOREIGN KEY, quindi la gestiamo a livello applicativo

  // Tabella ACQUISTO (per tracciare tutti gli acquisti/pagamenti)
  database.exec(`
    CREATE TABLE IF NOT EXISTS acquisto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studenteId INTEGER NOT NULL,
      tipoProdotto VARCHAR(50) NOT NULL,
      nomeProdotto VARCHAR(255) NOT NULL,
      importo INTEGER NOT NULL,
      importoEuro REAL NOT NULL,
      stripeSessionId VARCHAR(255) NOT NULL,
      coinsAggiunti INTEGER NULL,
      mesiAbbonamento INTEGER NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studenteId) REFERENCES studente(id) ON DELETE RESTRICT
    );
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_acquisto_studenteId ON acquisto(studenteId);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_acquisto_createdAt ON acquisto(createdAt);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_acquisto_stripeSessionId ON acquisto(stripeSessionId);
  `);

  // commentato tanto é stato giá testato
  //console.log('✅ Database inizializzato correttamente');
}

function ensureColumn(
  database: Database.Database,
  tableName: string,
  columnName: string,
  columnDefinition: string
): void {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName});`)
    .all() as Array<{ name: string }>;

  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    database.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`
    );
  }
}

/**
 * Aggiorna gli utenti esistenti assegnando loro i coin di benvenuto
 * Solo se non hanno ancora il campo coins o hanno 0 coin
 */
function updateExistingUsersWithWelcomeCoins(database: Database.Database): void {
  const WELCOME_COINS = 50; // Coin di benvenuto per nuovi utenti
  
  try {
    // Controlla se la colonna coins esiste
    const columns = database
      .prepare(`PRAGMA table_info(studente);`)
      .all() as Array<{ name: string }>;
    
    const hasCoinsColumn = columns.some((col) => col.name === 'coins');
    
    if (hasCoinsColumn) {
      // Aggiorna solo gli utenti che hanno 0 coin (probabilmente utenti esistenti)
      // o che non hanno ancora il campo impostato
      const result = database
        .prepare(
          `UPDATE studente 
           SET coins = ? 
           WHERE coins IS NULL OR coins = 0`
        )
        .run(WELCOME_COINS);
      
      if (result.changes > 0) {
        console.log(`✅ Assegnati ${WELCOME_COINS} coin di benvenuto a ${result.changes} utenti esistenti`);
      }
    }
  } catch (error) {
    // Se c'è un errore, probabilmente la colonna non esiste ancora
    // Non è un problema, verrà gestita da ensureColumn
    console.log('ℹ️ Coin di benvenuto: colonna non ancora disponibile');
  }
}

/**
 * Chiude la connessione al database
 * Utile per cleanup o test
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

