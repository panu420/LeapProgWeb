"use client";

import Link from "next/link";
import { QuizSummary } from "@/types/quiz";

interface QuizListProps {
  quizzes: QuizSummary[];
  onDelete: (id: number) => Promise<void>;
}

export function QuizList({ quizzes, onDelete }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nessun quiz salvato. Generane uno con l&apos;AI!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <article
          key={quiz.id}
          className="border border-gray-200 rounded-xl bg-white p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {quiz.titolo}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {quiz.difficolta.toUpperCase()} • {quiz.totalQuestions} domande •{" "}
              {new Date(quiz.createdAt).toLocaleDateString("it-IT")}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span>
                Tentativi: <strong>{quiz.completedAttempts}</strong>
              </span>
              {quiz.bestScore != null && (
                <span>
                  Miglior punteggio:{" "}
                  <strong>
                    {quiz.bestScore}/{quiz.totalQuestions}
                  </strong>
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/quiz/${quiz.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apri quiz
            </Link>
            <button
              onClick={() => onDelete(quiz.id)}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Elimina
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

