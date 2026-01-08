"use client";

import { useState } from "react";
import { QuizSummary } from "@/types/quiz";
import { QuizForm } from "./QuizForm";
import { QuizList } from "./QuizList";

/**
 * Props del componente QuizClient
 */
interface QuizClientProps {
  /** Lista iniziale dei quiz caricata dal server */
  initialQuizzes: QuizSummary[];
  /** Lista appunti per la selezione nel form (opzionale per generazione basata su appunto) */
  appunti: Array<{ id: number; titolo: string }>;
}

/**
 * Componente client principale per la gestione dei quiz
 * Gestisce la creazione di quiz tramite AI e la visualizzazione della lista
 */
export function QuizClient({ initialQuizzes, appunti }: QuizClientProps) {
  // === STATO LOCALE ===
  
  /** Lista dei quiz (inizializzata con i dati dal server) */
  const [quizzes, setQuizzes] = useState<QuizSummary[]>(initialQuizzes);
  
  /** Messaggio di notifica temporaneo (mostrato per 3 secondi) */
  const [toast, setToast] = useState<string | null>(null);

  // === HANDLER OPERAZIONI ===
  
  /**
   * Crea un nuovo quiz tramite generazione AI
   * Chiamata API POST /api/quiz
   * @param payload - Parametri per la generazione (titolo, subject, difficoltà, etc.)
   * @throws Error se coin insufficienti o errore server
   */
  const handleCreate = async (payload: {
    titolo: string;
    subject: string;
    difficolta: string;
    numDomande: number;
    appuntoId?: number;
  }) => {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      // Gestione errore coin insufficienti per generazione AI
      if (data.requiresPayment && data.cost) {
        throw new Error(
          `Coin insufficienti! Servono ${data.cost} coin per generare un quiz con AI. ` +
          `Gli utenti abbonati hanno accesso illimitato. Vai al negozio per acquistare coin o abbonarti.`
        );
      }
      throw new Error(data.error || "Errore creazione quiz");
    }
    // Aggiunge il nuovo quiz all'inizio della lista
    setQuizzes((prev) => [data.quiz, ...prev]);
    setToast("Quiz creato con successo");
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Elimina un quiz
   * Chiamata API DELETE /api/quiz/[id]
   * Richiede conferma dell'utente prima dell'eliminazione
   * @param id - ID del quiz da eliminare
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi eliminare questo quiz?")) return;
    const response = await fetch(`/api/quiz/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore durante l'eliminazione");
      return;
    }
    // Rimuove il quiz dalla lista locale
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
  };

  // === RENDERING ===
  
  return (
    <div className="space-y-8">
      {/* Sezione form creazione quiz con AI */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Generatore AI
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Crea un nuovo quiz
            </h2>
          </div>
          {/* Toast di notifica (mostrato per 3 secondi) */}
          {toast && (
            <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {toast}
            </span>
          )}
        </div>
        <QuizForm appunti={appunti} onCreate={handleCreate} />
      </section>

      {/* Sezione lista quiz creati */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          I tuoi quiz
        </h2>
        <QuizList quizzes={quizzes} onDelete={handleDelete} />
      </section>
    </div>
  );
}

