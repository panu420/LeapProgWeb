/**
 * Componente Modale Negozio
 * Client component per acquistare coin o abbonamenti
 */

'use client';

import { useState, useEffect } from 'react';
import { PRODUCT_PRICES } from '@/lib/stripe';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  isSubscribed: boolean;
}

export function ShopModal({
  isOpen,
  onClose,
  currentCoins,
  isSubscribed,
}: ShopModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async (productType: string) => {
    setLoading(productType);
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect a Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Errore nella creazione del pagamento');
        setLoading(null);
      }
    } catch (error) {
      console.error('Errore acquisto:', error);
      alert('Errore durante l\'acquisto');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Negozio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Saldo attuale */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coin disponibili</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {currentCoins}
              </p>
            </div>
            {isSubscribed && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">✓ Abbonato</p>
                <p className="text-xs">Accesso illimitato all&apos;AI</p>
              </div>
            )}
          </div>
        </div>

        {/* Prodotti Coin */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acquista Coin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Pacchetto 100 Coin */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">100</p>
                <p className="text-sm text-gray-600 mb-2">Coin</p>
                <p className="text-xl font-bold text-blue-600 mb-4">€2,99</p>
                <button
                  onClick={() => handlePurchase('COINS_100')}
                  disabled={loading !== null}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'COINS_100' ? 'Caricamento...' : 'Acquista'}
                </button>
              </div>
            </div>

            {/* Pacchetto 250 Coin */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">250</p>
                <p className="text-sm text-gray-600 mb-2">Coin</p>
                <p className="text-xl font-bold text-blue-600 mb-4">€6,99</p>
                <button
                  onClick={() => handlePurchase('COINS_250')}
                  disabled={loading !== null}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'COINS_250' ? 'Caricamento...' : 'Acquista'}
                </button>
              </div>
            </div>

            {/* Pacchetto 500 Coin */}
            <div className="border-2 border-blue-500 rounded-lg p-4 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                POPOLARE
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">500</p>
                <p className="text-sm text-gray-600 mb-2">Coin</p>
                <p className="text-xl font-bold text-blue-600 mb-4">€12,99</p>
                <button
                  onClick={() => handlePurchase('COINS_500')}
                  disabled={loading !== null}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'COINS_500' ? 'Caricamento...' : 'Acquista'}
                </button>
              </div>
            </div>
          </div>

          {/* Abbonamenti */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">
            Abbonamenti
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Abbonamento Mensile */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  Abbonamento Mensile
                </p>
                <p className="text-3xl font-bold text-blue-600 mb-2">€8,00</p>
                <p className="text-sm text-gray-600 mb-4">al mese</p>
                <ul className="text-left text-sm text-gray-600 mb-4 space-y-2">
                  <li>✓ Accesso illimitato all&apos;AI</li>
                  <li>✓ Generazione appunti gratuita</li>
                  <li>✓ Generazione quiz gratuita</li>
                  <li>✓ Generazione vero/falso gratuita</li>
                </ul>
                <button
                  onClick={() => handlePurchase('SUBSCRIPTION_MONTHLY')}
                  disabled={loading !== null || isSubscribed}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'SUBSCRIPTION_MONTHLY'
                    ? 'Caricamento...'
                    : isSubscribed
                    ? 'Già abbonato'
                    : 'Abbonati'}
                </button>
              </div>
            </div>

            {/* Abbonamento Annuale */}
            <div className="border-2 border-green-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                MIGLIOR OFFERTA
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  Abbonamento Annuale
                </p>
                <p className="text-3xl font-bold text-green-600 mb-2">€79,00</p>
                <p className="text-sm text-gray-600 mb-1">all&apos;anno</p>
                <p className="text-xs text-green-600 font-semibold mb-4">
                  Risparmia €17 rispetto al mensile!
                </p>
                <ul className="text-left text-sm text-gray-600 mb-4 space-y-2">
                  <li>✓ Accesso illimitato all&apos;AI</li>
                  <li>✓ Generazione appunti gratuita</li>
                  <li>✓ Generazione quiz gratuita</li>
                  <li>✓ Generazione vero/falso gratuita</li>
                </ul>
                <button
                  onClick={() => handlePurchase('SUBSCRIPTION_YEARLY')}
                  disabled={loading !== null || isSubscribed}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'SUBSCRIPTION_YEARLY'
                    ? 'Caricamento...'
                    : isSubscribed
                    ? 'Già abbonato'
                    : 'Abbonati'}
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Suggerimento:</strong> Completa le missioni giornaliere
              per guadagnare coin gratuiti!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

