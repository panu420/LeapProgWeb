/**
 * Componente Client per dettaglio classe
 * Mostra classifica e appunti condivisi
 */

"use client";

import { useState } from "react";
import Link from "next/link";

interface ClassificaEntry {
  id: number;
  nome: string;
  punti: number;
  livello: number;
}

interface AppuntoCondiviso {
  id: number;
  titolo: string;
  studenteId: number;
  sharedAt: string;
  autoreNome: string;
}

interface ClasseDetailClientProps {
  classeId: number;
  classifica: ClassificaEntry[];
  appunti: AppuntoCondiviso[];
  myAppunti: Array<{ id: number; titolo: string }>;
  isCreator: boolean;
}

export function ClasseDetailClient({
  classeId,
  classifica,
  appunti,
  myAppunti,
  isCreator,
}: ClasseDetailClientProps) {
  const [selectedAppunto, setSelectedAppunto] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!selectedAppunto) return;
    setSharing(true);
    try {
      const response = await fetch("/api/appunti/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appuntoId: selectedAppunto, classeId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore condivisione");
      }
      alert("Appunto condiviso con successo!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Classifica */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Classifica
        </h2>
        {classifica.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuno studente nella classe</p>
        ) : (
          <div className="space-y-3">
            {classifica.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-600 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{entry.nome}</p>
                    <p className="text-xs text-gray-500">
                      Livello {entry.livello}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-indigo-600">
                  {entry.punti} pt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appunti Condivisi */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Appunti Condivisi
          </h2>
          {myAppunti.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedAppunto ?? ""}
                onChange={(e) =>
                  setSelectedAppunto(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="text-sm border border-gray-300 rounded-lg px-3 py-1"
              >
                <option value="">Seleziona appunto...</option>
                {myAppunti.map((appunto) => (
                  <option key={appunto.id} value={appunto.id}>
                    {appunto.titolo}
                  </option>
                ))}
              </select>
              <button
                onClick={handleShare}
                disabled={!selectedAppunto || sharing}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {sharing ? "..." : "Condividi"}
              </button>
            </div>
          )}
        </div>
        {appunti.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nessun appunto condiviso ancora
          </p>
        ) : (
          <div className="space-y-3">
            {appunti.map((appunto) => (
              <Link
                key={appunto.id}
                href={`/appunti?shared=${appunto.id}`}
                className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{appunto.titolo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  di {appunto.autoreNome} •{" "}
                  {new Date(appunto.sharedAt).toLocaleDateString("it-IT")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

