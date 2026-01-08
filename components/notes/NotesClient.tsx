"use client";

import { useState } from "react";
import { Nota } from "@/types/note";
import { NoteForm } from "./NoteForm";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";

/**
 * Props del componente NotesClient
 */
interface NotesClientProps {
  /** Lista iniziale degli appunti caricata dal server */
  initialNotes: Nota[];
}

/**
 * Componente client principale per la gestione degli appunti
 * Gestisce lo stato locale, la selezione e le operazioni CRUD sugli appunti
 */
export function NotesClient({ initialNotes }: NotesClientProps) {
  // === STATO LOCALE ===
  
  /** Lista degli appunti (inizializzata con i dati dal server) */
  const [notes, setNotes] = useState<Nota[]>(initialNotes);
  
  /** ID dell'appunto attualmente selezionato per la visualizzazione/modifica */
  const [selectedId, setSelectedId] = useState<number | null>(
    initialNotes[0]?.id ?? null
  );
  
  /** Messaggio di notifica temporaneo (mostrato per 3 secondi) */
  const [toast, setToast] = useState("");

  // === VARIABILI DERIVATE ===
  
  /** Oggetto dell'appunto attualmente selezionato (o null se nessuno) */
  const selectedNote = notes.find((note) => note.id === selectedId) || null;

  // === FUNZIONI DI UTILITÀ ===
  
  /**
   * Aggiorna la selezione dopo modifica/eliminazione della lista
   * Se l'appunto selezionato è stato rimosso, seleziona il primo disponibile
   * @param updatedNotes - Lista aggiornata degli appunti
   * @param removedId - ID dell'appunto rimosso (opzionale)
   */
  const refreshSelection = (updatedNotes: Nota[], removedId?: number) => {
    if (removedId && selectedId === removedId) {
      setSelectedId(updatedNotes[0]?.id ?? null);
      return;
    }
    if (!updatedNotes.some((n) => n.id === selectedId)) {
      setSelectedId(updatedNotes[0]?.id ?? null);
    }
  };

  // === HANDLER OPERAZIONI CRUD ===
  
  /**
   * Crea un nuovo appunto (manuale o con AI)
   * Chiamata API POST /api/appunti
   * @param payload - Dati per la creazione (titolo, contenuto o prompt AI)
   * @throws Error se coin insufficienti o errore server
   */
  const handleCreate = async (payload: {
    titolo: string;
    contenuto?: string;
    generateWithAI: boolean;
    subjectQuery?: string;
    details?: string;
  }) => {
    const response = await fetch("/api/appunti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      // Gestione errore coin insufficienti per generazione AI
      if (data.requiresPayment && data.cost) {
        throw new Error(
          `Coin insufficienti! Servono ${data.cost} coin per generare un appunto con AI. ` +
          `Gli utenti abbonati hanno accesso illimitato. Vai al negozio per acquistare coin o abbonarti.`
        );
      }
      throw new Error(data.error || "Errore nella creazione");
    }

    // Aggiunge il nuovo appunto all'inizio della lista e lo seleziona
    setNotes((prev) => [data.note, ...prev]);
    setSelectedId(data.note.id);
    setToast("Appunto creato");
    setTimeout(() => setToast(""), 3000);
  };

  /**
   * Aggiorna un appunto esistente
   * Chiamata API PUT /api/appunti/[id]
   * @param params - ID, titolo e contenuto aggiornati
   * @throws Error se errore server
   */
  const handleUpdate = async ({
    id,
    titolo,
    contenuto,
  }: {
    id: number;
    titolo: string;
    contenuto: string;
  }) => {
    const response = await fetch(`/api/appunti/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titolo, contenuto }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Errore nella modifica");
    }

    // Aggiorna l'appunto nella lista locale
    setNotes((prev) => prev.map((note) => (note.id === id ? data.note : note)));
  };

  /**
   * Elimina un appunto
   * Chiamata API DELETE /api/appunti/[id]
   * Richiede conferma dell'utente prima dell'eliminazione
   * @param id - ID dell'appunto da eliminare
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi eliminare questo appunto?")) return;

    const response = await fetch(`/api/appunti/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore nell'eliminazione");
      return;
    }

    // Rimuove l'appunto dalla lista e aggiorna la selezione
    setNotes((prev) => {
      const next = prev.filter((note) => note.id !== id);
      refreshSelection(next, id);
      return next;
    });
    setToast("Appunto eliminato");
    setTimeout(() => setToast(""), 3000);
  };

  // === RENDERING ===
  
  return (
    <div className="space-y-8">
      {/* Sezione form creazione appunto */}
      <section className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Gestione Appunti
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Crea nuovo appunto</h2>
          </div>
          {/* Toast di notifica (mostrato per 3 secondi) */}
          {toast && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {toast}
            </span>
          )}
        </div>
        <NoteForm onCreate={handleCreate} />
      </section>

      {/* Layout a due colonne: lista appunti + editor */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna sinistra: lista appunti */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            I tuoi appunti
          </h3>
          <NoteList
            notes={notes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
          />
        </div>
        {/* Colonna destra: editor appunto selezionato (2 colonne su lg) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dettagli appunto
          </h3>
          <NoteEditor note={selectedNote} onUpdate={handleUpdate} />
        </div>
      </section>
    </div>
  );
}

