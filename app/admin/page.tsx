/**
 * Pagina Dashboard Amministratore
 * Mostra le KPI e statistiche della piattaforma
 * Accessibile solo agli utenti con isAdmin = 1
 */

import { redirect } from 'next/navigation';
import { getAuthUser, isAdmin } from '@/lib/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminPage() {
  // Verifica autenticazione
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  // Verifica che l'utente sia admin
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardClient />
    </div>
  );
}



