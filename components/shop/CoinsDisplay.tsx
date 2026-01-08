/**
 * Componente per visualizzare il saldo coin nell'header
 * Client component che mostra coin, stato abbonamento e apre il negozio
 */

'use client';

import { useState, useEffect } from 'react';
import { ShopModal } from './ShopModal';

/**
 * Componente per la visualizzazione dei coin nell'header
 * Si aggiorna automaticamente ogni 30 secondi e dopo acquisti
 */
export function CoinsDisplay() {
  // === STATO LOCALE ===
  
  /** Saldo coin corrente dell'utente */
  const [coins, setCoins] = useState<number>(0);
  
  /** true se l'utente ha un abbonamento attivo */
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  
  /** Controlla apertura/chiusura modale negozio */
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  /** Stato di caricamento iniziale */
  const [loading, setLoading] = useState(true);

  // === HOOK USEEFFECT ===
  
  /**
   * Carica i coin al mount e configura auto-refresh ogni 30 secondi
   * La funzione di cleanup ferma l'intervallo quando il componente viene smontato
   */
  useEffect(() => {
    // Caricamento iniziale
    fetchCoins();
    
    // Configura intervallo per aggiornamento automatico ogni 30 secondi
    const interval = setInterval(fetchCoins, 30000);
    
    // Cleanup: ferma l'intervallo quando il componente viene smontato
    return () => clearInterval(interval);
  }, []); // Array vuoto = eseguito solo una volta al mount

  // === FUNZIONI DI FETCH ===
  
  /**
   * Recupera il saldo coin e lo stato abbonamento dell'utente
   * Chiamata API GET /api/user/coins
   */
  const fetchCoins = async () => {
    try {
      const response = await fetch('/api/user/coins');
      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins);
        setIsSubscribed(data.subscribed);
      }
    } catch (error) {
      console.error('Errore recupero coin:', error);
    } finally {
      setLoading(false);
    }
  };

  // === RENDERING CONDIZIONALE ===
  
  // Mostra spinner durante caricamento iniziale
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // === RENDERING ===
  
  return (
    <>
      {/* Pulsante coin con gradiente (apre modale negozio al click) */}
      <button
        onClick={() => setIsShopOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
      >
        {/* Icona coin */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {/* Saldo coin */}
        <span className="font-semibold">{coins}</span>
        {/* Badge PRO (mostrato solo se abbonato) */}
        {isSubscribed && (
          <span className="text-xs bg-green-500 px-2 py-0.5 rounded">PRO</span>
        )}
      </button>

      {/* Modale negozio (per acquisto coin e abbonamenti) */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => {
          setIsShopOpen(false);
          fetchCoins(); // Aggiorna coin dopo chiusura modale (potrebbero essere stati acquistati)
        }}
        currentCoins={coins}
        isSubscribed={isSubscribed}
      />
    </>
  );
}

