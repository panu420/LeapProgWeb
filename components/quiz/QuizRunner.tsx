"use client";

import { useState } from "react";

interface QuizRunnerProps {
  quizId: number;
  totalQuestions: number;
  completedAttempts: number;
  bestScore?: number;
  questions: Array<{
    id: number;
    text: string;
    options: string[];
  }>;
}

interface QuestionReview {
  id: number;
  question: string;
  selectedIndex: number | null;
  correctIndex: number;
  correctText: string;
  isCorrect: boolean;
  options: string[];
}

interface ResultState {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  newPoints: number;
  newLevel: number;
  questions: QuestionReview[];
}

export function QuizRunner({
  quizId,
  completedAttempts,
  bestScore,
  questions,
}: QuizRunnerProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (answers.some((answer) => answer === null)) {
      setError("Rispondi a tutte le domande prima di inviare il quiz.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers.map((answer) => Number(answer)),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore nella valutazione del quiz");
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
        {result && (
          <span className="text-green-600 font-medium">
            +{result.pointsEarned} punti ({result.correctAnswers}/
            {result.totalQuestions} risposte corrette)
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <article key={question.id} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {index + 1}. {question.text}
            </h3>
            <div className="grid gap-3">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`border rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer transition-all ${
                    answers[index] === optionIndex
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    className="accent-blue-600"
                    checked={answers[index] === optionIndex}
                    onChange={() => handleAnswer(index, optionIndex)}
                    disabled={!!result}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          Quiz completato! Nuovo livello: <strong>{result.newLevel}</strong> •
          Punti totali: <strong>{result.newPoints}</strong>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">
            Revisione risposte
          </h4>
          {result.questions.map((detail, index) => (
            <div
              key={detail.id}
              className={`rounded-xl border px-4 py-3 ${
                detail.isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">
                {index + 1}. {detail.question}
              </p>
              <p
                className={`text-sm mt-2 ${
                  detail.isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {detail.isCorrect
                  ? "Risposta corretta! Ottimo lavoro."
                  : "Risposta errata."}
              </p>
              {!detail.isCorrect && (
                <p className="text-sm text-gray-700 mt-1">
                  Motivazione: la risposta corretta era{" "}
                  <strong>
                    {String.fromCharCode(65 + detail.correctIndex)}.{" "}
                    {detail.correctText}
                  </strong>
                  . Rivedi l&apos;argomento e riprova!
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !!result}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "Invio in corso..." : "Invia risposte"}
        </button>
        {result && (
          <button
            onClick={handleRetry}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Nuovo tentativo
          </button>
        )}
      </div>
    </section>
  );
}

