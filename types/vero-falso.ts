/**
 * Tipi specifici per Vero/Falso
 */

export interface VeroFalsoQuestion {
  id: number;
  affermazione: string;
  rispostaCorretta: boolean; // true = Vero, false = Falso
  ordine: number;
}

export interface VeroFalso {
  id: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
  createdAt: string;
  questions: VeroFalsoQuestion[];
}

export interface VeroFalsoSubmission {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  newPoints: number;
  newLevel: number;
  questions: Array<{
    id: number;
    affermazione: string;
    selectedAnswer: boolean | null;
    correctAnswer: boolean;
    isCorrect: boolean;
  }>;
}

export interface VeroFalsoCreateRequest {
  titolo: string;
  subject?: string;
  difficolta: string;
  numDomande: number;
  appuntoId?: number;
}

