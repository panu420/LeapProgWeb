/**
 * Componente per eseguire un esercizio Vero/Falso
 * Gestisce risposte, submit e visualizzazione risultati
 */

"use client";

import { useState } from "react";

interface VeroFalsoRunnerProps {
  veroFalsoId: number;
  totalQuestions: number;
  completedAttempts: number;
  bestScore?: number;
  questions: Array<{
    id: number;
    affermazione: string;
    rispostaCorretta: boolean;
  }>;
}

interface QuestionReview {
  id: number;
  affermazione: string;
  selectedAnswer: boolean | null;
  correctAnswer: boolean;
  isCorrect: boolean;
}

interface ResultState {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  newPoints: number;
  newLevel: number;
  questions: QuestionReview[];
}

export function VeroFalsoRunner({
  veroFalsoId,
  completedAttempts,
  bestScore,
  questions,
}: VeroFalsoRunnerProps) {
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    Array(questions.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionIndex: number, value: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (answers.some((answer) => answer === null)) {
      setError("Rispondi a tutte le affermazioni prima di inviare.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/vero-falso/${veroFalsoId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore nella valutazione");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers(Array(questions.length).fill(null));
    setError(null);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow p-6 space-y-6">
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span>
          Tentativi completati: <strong>{completedAttempts}</strong>
        </span>
        {bestScore != null && (
          <span>
            Miglior punteggio: <strong>{bestScore}</strong>
          </span>
        )}
      </div>

      {!result ? (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-5 space-y-3"
              >
                <p className="font-medium text-gray-900">
                  {index + 1}. {question.affermazione}
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[index] === true}
                      onChange={() => handleAnswer(index, true)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Vero</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[index] === false}
                      onChange={() => handleAnswer(index, false)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Falso</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Invio in corso..." : "Invia risposte"}
          </button>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Risultato: {result.correctAnswers}/{result.totalQuestions}
            </h3>
            <p className="text-gray-600 mb-4">
              Hai guadagnato <strong>{result.pointsEarned} punti</strong>!
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-gray-600">
                Punti totali: <strong>{result.newPoints}</strong>
              </span>
              <span className="text-gray-600">
                Livello: <strong>{result.newLevel}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Dettaglio risposte:
            </h4>
            {result.questions.map((q, index) => (
              <div
                key={q.id}
                className={`border rounded-lg p-4 ${
                  q.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="font-medium text-gray-900 mb-2">
                  {index + 1}. {q.affermazione}
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    La tua risposta:{" "}
                    <strong>
                      {q.selectedAnswer === null
                        ? "Nessuna"
                        : q.selectedAnswer
                        ? "Vero"
                        : "Falso"}
                    </strong>
                  </p>
                  <p>
                    Risposta corretta:{" "}
                    <strong>{q.correctAnswer ? "Vero" : "Falso"}</strong>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-gray-600 mt-2 italic">
                      La risposta corretta era{" "}
                      <strong>{q.correctAnswer ? "Vero" : "Falso"}</strong>.
                      {q.correctAnswer
                        ? " L'affermazione è corretta."
                        : " L'affermazione è errata."}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Nuovo tentativo
          </button>
        </div>
      )}
    </section>
  );
}

