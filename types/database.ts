/**
 * Tipi TypeScript per le entità del database
 * Corrispondono esattamente alle tabelle SQLite
 */

export interface Studente {
  id: number;
  email: string;
  nome: string;
  password_hash: string;
  livello: number;
  punti: number;
  isAdmin: number; // 0 = false, 1 = true (SQLite non ha BOOLEAN nativo)
  coins: number; // Coin disponibili per funzioni AI
  isSubscribed: number; // 0 = false, 1 = true
  subscriptionExpiresAt: string | null; // ISO string o null
  createdAt: string; // ISO string
}

export interface Appunto {
  id: number;
  studenteId: number;
  titolo: string;
  contenuto: string;
  classeId?: number | null;
  sharedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  appuntoId: number | null;
  studenteId: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
  createdAt: string;
}

export interface DomandaQuiz {
  id: number;
  quizId: number;
  domanda: string;
  opzione1: string;
  opzione2: string;
  opzione3: string;
  opzione4: string;
  rispostaCorretta: number; // 1-4
  ordine: number;
}

export interface VeroFalso {
  id: number;
  appuntoId: number | null;
  studenteId: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
  createdAt: string;
}

export interface DomandaVeroFalso {
  id: number;
  veroFalsoId: number;
  affermazione: string;
  rispostaCorretta: number; // 0 o 1 (false/true)
  ordine: number;
}

export interface MissioneCompletata {
  id: number;
  studenteId: number;
  missioneId: string;
  dataCompletamento: string; // DATE format YYYY-MM-DD
  createdAt: string;
}

export interface Classe {
  id: number;
  nome: string;
  codice: string;
  creatoreId: number;
  createdAt: string;
}

export interface StudenteClasse {
  id: number;
  studenteId: number;
  classeId: number;
  joinedAt: string;
}

