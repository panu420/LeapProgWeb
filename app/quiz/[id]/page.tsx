import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { QuizRunner } from '@/components/quiz/QuizRunner';

/**
 * Interfaccia per le domande quiz dal database
 */
interface QuestionDto {
  id: number;
  domanda: string;
  opzione1: string;
  opzione2: string;
  opzione3: string;
  opzione4: string;
  ordine: number;
}

/**
 * Pagina di dettaglio e svolgimento quiz
 * Route dinamica: /quiz/[id]
 * 
 * @param params - Parametri della route (contiene l'id del quiz)
 * @returns Pagina con quiz runner per lo svolgimento interattivo
 */
export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // Next.js 15: params è una Promise
}) {
  // === AUTENTICAZIONE ===
  // Verifica che l'utente sia autenticato
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  // === ESTRAZIONE PARAMETRI ROUTE ===
  // Await dei params per ottenere l'id dalla route dinamica
  const { id } = await params;
  
  // === CARICAMENTO DATI DAL DATABASE ===
  const db = getDatabase();
  
  // Recupera i dati del quiz verificando che appartenga all'utente loggato
  const quiz = db
    .prepare(
      `SELECT id, studenteId, titolo, difficolta, totalQuestions, createdAt,
              lastScore, bestScore, completedAttempts
       FROM quiz WHERE id = ? AND studenteId = ?`
    )
    .get(Number(id), user.id);

  // Se il quiz non esiste o non appartiene all'utente, redirect alla lista quiz
  if (!quiz) {
    redirect('/quiz');
  }

  // Recupera tutte le domande del quiz ordinate per ordine
  const questions = db
    .prepare(
      `SELECT id, domanda, opzione1, opzione2, opzione3, opzione4, ordine
       FROM domanda_quiz WHERE quizId = ? ORDER BY ordine ASC`
    )
    .all(Number(id)) as QuestionDto[];

  // Formatta le domande per il componente QuizRunner (testo + array opzioni)
  const formattedQuestions = questions.map((question) => ({
    id: question.id,
    text: question.domanda,
    options: [
      question.opzione1,
      question.opzione2,
      question.opzione3,
      question.opzione4,
    ],
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con pulsanti di navigazione */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Quiz • {quiz.difficolta.toUpperCase()}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {quiz.titolo}
            </h1>
            <p className="text-sm text-gray-500">
              Creato il {new Date(quiz.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>
          {/* Pulsanti di navigazione: torna ai quiz e alla dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/quiz"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Torna ai quiz
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>

        <QuizRunner
          quizId={quiz.id}
          totalQuestions={quiz.totalQuestions}
          completedAttempts={quiz.completedAttempts}
          bestScore={quiz.bestScore ?? undefined}
          questions={formattedQuestions}
        />
      </div>
    </div>
  );
}

