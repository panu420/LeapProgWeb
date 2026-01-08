/**
 * Tipi per quiz e domande
 */

export interface QuizSummary {
  id: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  createdAt: string;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  domanda: string;
  opzione1: string;
  opzione2: string;
  opzione3: string;
  opzione4: string;
  rispostaCorretta: number;
  ordine: number;
}

export interface QuizDetail extends QuizSummary {
  questions: QuizQuestion[];
}

export interface SubmitQuizPayload {
  answers: number[];
}

export interface SubmitQuizResult {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  newLevel: number;
  newPoints: number;
}

