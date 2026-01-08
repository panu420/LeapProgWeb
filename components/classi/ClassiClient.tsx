/**
 * Componente Client per gestione classi
 * Permette di creare nuove classi e unirsi a classi esistenti tramite codice
 */

"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Interfaccia per una classe
 */
interface Classe {
  id: number;
  nome: string;
  codice: string; // Codice univoco a 6 caratteri per unirsi
  creatoreId: number;
  createdAt: string;
  isCreator: number; // 0 = membro, 1 = creatore
}

/**
 * Props del componente ClassiClient
 */
interface ClassiClientProps {
  /** Lista iniziale delle classi a cui l'utente appartiene */
  initialClassi: Classe[];
}

/**
 * Componente client per la gestione delle classi
 * Gestisce la creazione di nuove classi e l'unione a classi esistenti tramite codice
 */
export function ClassiClient({ initialClassi }: ClassiClientProps) {
  // === STATO LOCALE ===
  
  /** Lista delle classi dell'utente (inizializzata con i dati dal server) */
  const [classi, setClassi] = useState<Classe[]>(initialClassi);
  
  /** Mostra/nascondi form creazione classe */
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  /** Mostra/nascondi form unione a classe */
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  /** Nome della nuova classe da creare */
  const [nome, setNome] = useState("");
  
  /** Codice della classe a cui unirsi */
  const [codice, setCodice] = useState("");
  
  /** Stato di caricamento delle richieste API */
  const [loading, setLoading] = useState(false);
  
  /** Messaggio di errore (mostrato se presente) */
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/classi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore creazione classe");
      }
      setClassi((prev) => [data.classe, ...prev]);
      setNome("");
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/classi/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codice: codice.toUpperCase() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore unione classe");
      }
      // Ricarica la pagina per vedere la nuova classe
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Creazione */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Crea una nuova classe
          </h2>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowJoinForm(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {showCreateForm ? "Annulla" : "Crea Classe"}
          </button>
        </div>
        {showCreateForm && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome classe
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Es. Matematica 2024"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Creazione..." : "Crea"}
            </button>
          </form>
        )}
      </div>

      {/* Form Unione */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Unisciti a una classe
          </h2>
          <button
            onClick={() => {
              setShowJoinForm(!showJoinForm);
              setShowCreateForm(false);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {showJoinForm ? "Annulla" : "Unisciti"}
          </button>
        </div>
        {showJoinForm && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Codice classe
              </label>
              <input
                value={codice}
                onChange={(e) => setCodice(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                placeholder="ABC123"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Unione..." : "Unisciti"}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista Classi */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Le tue classi
        </h2>
        {classi.length === 0 ? (
          <p className="text-sm text-gray-500">
            Non appartieni a nessuna classe. Crea una classe o unisciti a una esistente!
          </p>
        ) : (
          <div className="space-y-3">
            {classi.map((classe) => (
              <Link
                key={classe.id}
                href={`/classi/${classe.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {classe.nome}
                      {classe.isCreator === 1 && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Creatore
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Codice: <span className="font-mono">{classe.codice}</span>
                    </p>
                  </div>
                  <span className="text-indigo-600">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

