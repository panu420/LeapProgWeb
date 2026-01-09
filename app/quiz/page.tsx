import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { QuizClient } from '@/components/quiz/QuizClient';
import { QuizSummary } from '@/types/quiz';

/**
 * Interfaccia per i dati dell'appunto dal database (lista)
 */
interface AppuntoRow {
  id: number;
  titolo: string;
}

export default async function QuizPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const db = getDatabase();
  const quizzes = db
    .prepare(
      `SELECT id, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM quiz WHERE studenteId = ? ORDER BY createdAt DESC`
    )
    .all(user.id) as QuizSummary[];

  const appunti = db
    .prepare('SELECT id, titolo FROM appunto WHERE studenteId = ? ORDER BY createdAt DESC LIMIT 50')
    .all(user.id) as AppuntoRow[];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header con pulsante back alla dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Allenamento
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Quiz AI</h1>
            <p className="text-gray-600">
              Genera quiz con l&apos;AI a partire da un argomento o dai tuoi appunti, e monitora i progressi.
            </p>
          </div>
          {/* Pulsante per tornare alla dashboard principale */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        <QuizClient initialQuizzes={quizzes} appunti={appunti} />
      </div>
    </div>
  );
}

