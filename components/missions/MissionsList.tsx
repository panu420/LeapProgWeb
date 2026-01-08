/**
 * Componente Client per visualizzare e completare le missioni giornaliere
 * Le missioni ruotano ogni giorno e assegnano punti + coin bonus
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Interfaccia per il progresso di una missione
 */
interface MissionProgress {
  mission: {
    id: string;
    title: string;
    description: string;
    type: string;
    target: number; // Obiettivo da raggiungere (es. 3 quiz)
    pointsReward: number; // Punti guadagnati al completamento
    coinReward?: number; // Coin guadagnati al completamento (opzionale)
  };
  progress: number; // Progresso attuale dell'utente
  completed: boolean; // true se già completata oggi
  completedAt: string | null; // Data completamento
}

/**
 * Componente per la visualizzazione e gestione delle missioni giornaliere
 * Mostra il progresso, permette il completamento e aggiorna automaticamente lo stato
 */
export function MissionsList() {
  // === STATO LOCALE ===
  
  /** Lista delle missioni con il loro progresso */
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  
  /** Stato di caricamento iniziale */
  const [loading, setLoading] = useState(true);
  
  /** ID della missione in corso di completamento (per disabilitare pulsante) */
  const [completing, setCompleting] = useState<string | null>(null);

  // === HOOK USEEFFECT ===
  
  /**
   * Carica le missioni al mount del componente
   * Array di dipendenze vuoto [] = eseguito solo una volta al mount
   */
  useEffect(() => {
    fetchMissions();
  }, []);

  // === FUNZIONI DI FETCH ===
  
  /**
   * Carica le missioni dal server con il progresso dell'utente
   * Chiamata API GET /api/missions
   */
  const fetchMissions = async () => {
    try {
      const response = await fetch("/api/missions");
      const data = await response.json();
      if (response.ok) {
        setMissions(data.missions);
      }
    } catch (error) {
      console.error("Errore caricamento missioni:", error);
    } finally {
      setLoading(false);
    }
  };

  // === HANDLER COMPLETAMENTO ===
  
  /**
   * Completa una missione e assegna i punti/coin bonus
   * Chiamata API POST /api/missions/complete
   * @param missionId - ID della missione da completare
   */
  const handleComplete = async (missionId: string) => {
    // Previene click multipli durante il completamento
    if (completing) return;
    setCompleting(missionId);
    try {
      const response = await fetch("/api/missions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Ricarica le missioni per aggiornare lo stato
        await fetchMissions();
        const rewards = [];
        if (data.pointsReward) {
          rewards.push(`${data.pointsReward} punti`);
        }
        if (data.coinReward) {
          rewards.push(`${data.coinReward} coin`);
        }
        if (rewards.length > 0) {
          alert(`Missione completata! Hai guadagnato ${rewards.join(' e ')}!`);
        }
      } else {
        alert(data.error || "Errore nel completamento");
      }
    } catch (error) {
      alert("Errore nel completamento della missione");
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Caricamento missioni...
      </div>
    );
  }

  if (missions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {missions.map((missionProgress) => {
        const { mission, progress, completed } = missionProgress;
        const percentage = Math.min((progress / mission.target) * 100, 100);
        const canComplete = progress >= mission.target && !completed;

        return (
          <div
            key={mission.id}
            className={`border rounded-lg p-4 ${
              completed
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {mission.title}
                  </h3>
                  {completed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Completata
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {mission.description}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Progresso: {progress}/{mission.target}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        +{mission.pointsReward} punti
                      </span>
                      {mission.coinReward && mission.coinReward > 0 && (
                        <span className="font-medium text-amber-600">
                          +{mission.coinReward} 💰
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        completed
                          ? "bg-green-500"
                          : canComplete
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              {canComplete && (
                <button
                  onClick={() => handleComplete(mission.id)}
                  disabled={completing === mission.id}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {completing === mission.id ? "Completando..." : "Completa"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

