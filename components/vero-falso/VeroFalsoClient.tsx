/**
 * Componente Client principale per gestione Vero/Falso
 * Coordina form creazione e lista esercizi
 */

"use client";

import { useState } from "react";
import { VeroFalsoForm } from "./VeroFalsoForm";
import { VeroFalsoList } from "./VeroFalsoList";

interface VeroFalsoSummary {
  id: number;
  titolo: string;
  difficolta: string;
  totalQuestions: number;
  lastScore?: number | null;
  bestScore?: number | null;
  completedAttempts: number;
  createdAt: string;
}

interface VeroFalsoClientProps {
  initialVeroFalso: VeroFalsoSummary[];
  appunti: Array<{ id: number; titolo: string }>;
}

export function VeroFalsoClient({
  initialVeroFalso,
  appunti,
}: VeroFalsoClientProps) {
  const [veroFalso, setVeroFalso] =
    useState<VeroFalsoSummary[]>(initialVeroFalso);
  const [toast, setToast] = useState<string | null>(null);

  const handleCreate = async (payload: {
    titolo: string;
    subject?: string;
    difficolta: string;
    numDomande: number;
    appuntoId?: number;
  }) => {
    const response = await fetch("/api/vero-falso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.requiresPayment && data.cost) {
        throw new Error(
          `Coin insufficienti! Servono ${data.cost} coin per generare un esercizio Vero/Falso con AI. ` +
          `Gli utenti abbonati hanno accesso illimitato. Vai al negozio per acquistare coin o abbonarti.`
        );
      }
      throw new Error(data.error || "Errore creazione vero/falso");
    }
    setVeroFalso((prev) => [data.veroFalso, ...prev]);
    setToast("Esercizio Vero/Falso creato con successo");
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi eliminare questo esercizio Vero/Falso?")) return;
    const response = await fetch(`/api/vero-falso/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore durante l'eliminazione");
      return;
    }
    setVeroFalso((prev) => prev.filter((vf) => vf.id !== id));
  };

  return (
    <div className="space-y-8">
      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">
              Generatore AI
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Crea un nuovo esercizio Vero/Falso
            </h2>
          </div>
          {toast && (
            <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {toast}
            </span>
          )}
        </div>
        <VeroFalsoForm appunti={appunti} onCreate={handleCreate} />
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          I tuoi esercizi Vero/Falso
        </h2>
        <VeroFalsoList veroFalso={veroFalso} onDelete={handleDelete} />
      </section>
    </div>
  );
}

