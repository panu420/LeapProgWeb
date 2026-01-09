/**
 * API Route: GET /api/admin/purchases
 * Restituisce l'elenco di tutti gli acquisti effettuati
 * Accessibile solo agli utenti con isAdmin = 1
 */

import { NextResponse } from 'next/server';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET() {
  // Verifica autenticazione
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  // Verifica che l'utente sia admin
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Accesso negato. Solo amministratori.' },
      { status: 403 }
    );
  }

  const db = getDatabase();

  // Recupera tutti gli acquisti con informazioni dell'utente
  const acquisti = db
    .prepare(`
      SELECT 
        a.id,
        a.studenteId,
        s.nome as nomeUtente,
        s.email as emailUtente,
        a.tipoProdotto,
        a.nomeProdotto,
        a.importo,
        a.importoEuro,
        a.stripeSessionId,
        a.coinsAggiunti,
        a.mesiAbbonamento,
        a.createdAt
      FROM acquisto a
      INNER JOIN studente s ON a.studenteId = s.id
      ORDER BY a.createdAt DESC
    `)
    .all() as Array<{
      id: number;
      studenteId: number;
      nomeUtente: string;
      emailUtente: string;
      tipoProdotto: string;
      nomeProdotto: string;
      importo: number;
      importoEuro: number;
      stripeSessionId: string;
      coinsAggiunti: number | null;
      mesiAbbonamento: number | null;
      createdAt: string;
    }>;

  // Calcola statistiche aggregate
  const totalAcquisti = acquisti.length;
  const totaleRicavi = acquisti.reduce((sum, a) => sum + a.importoEuro, 0);
  const totaleCoinVenduti = acquisti
    .filter((a) => a.coinsAggiunti !== null)
    .reduce((sum, a) => sum + (a.coinsAggiunti || 0), 0);
  const totaleAbbonamenti = acquisti.filter(
    (a) => a.mesiAbbonamento !== null
  ).length;

  return NextResponse.json({
    acquisti,
    statistiche: {
      totalAcquisti,
      totaleRicavi: Math.round(totaleRicavi * 100) / 100,
      totaleCoinVenduti,
      totaleAbbonamenti,
    },
  });
}
