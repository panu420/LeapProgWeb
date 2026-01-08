/**
 * Dashboard Studente - Wireframe basilare
 * Mostra informazioni base e link alle sezioni principali
 */

import { redirect } from 'next/navigation';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { MissionsList } from '@/components/missions/MissionsList';
import { CoinsDisplay } from '@/components/shop/CoinsDisplay';

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const admin = await isAdmin();
  const db = getDatabase();

  // Conta appunti, quiz e vero/falso dello studente
  const appuntiCount = db
    .prepare('SELECT COUNT(*) as count FROM appunto WHERE studenteId = ?')
    .get(user.id) as { count: number };

  const quizCount = db
    .prepare('SELECT COUNT(*) as count FROM quiz WHERE studenteId = ?')
    .get(user.id) as { count: number };

  const veroFalsoCount = db
    .prepare('SELECT COUNT(*) as count FROM vero_falso WHERE studenteId = ?')
    .get(user.id) as { count: number };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Leap
            </h1>
            <div className="flex items-center gap-4">
              {admin && (
                <Link
                  href="/admin"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Dashboard Admin
                </Link>
              )}
              <CoinsDisplay />
              <Link
                href="/profilo"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Ciao, {user.nome}!
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Appunti */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appunti</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {appuntiCount.count}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Quiz */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {quizCount.count}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Vero/Falso */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vero/Falso</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {veroFalsoCount.count}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sezioni Principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sezione Appunti */}
          <Link
            href="/appunti"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appunti</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Crea e gestisci i tuoi appunti
                </p>
              </div>
            </div>
          </Link>

          {/* Sezione Quiz */}
          <Link
            href="/quiz"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quiz</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Crea e svolgi quiz a scelta multipla
                </p>
              </div>
            </div>
          </Link>

          {/* Sezione Vero/Falso */}
          <Link
            href="/vero-falso"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Vero/Falso
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Crea e svolgi esercizi vero/falso
                </p>
              </div>
            </div>
          </Link>

          {/* Sezione Classi */}
          <Link
            href="/classi"
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Classi</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Crea o unisciti a una classe per condividere e competere
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Missioni Giornaliere */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Missioni Giornaliere
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Completa le missioni di oggi per guadagnare punti bonus!
            </p>
          </div>
          <MissionsList />
        </div>
      </main>
    </div>
  );
}

