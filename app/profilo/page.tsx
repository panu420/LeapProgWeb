import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { ProfileClient } from '@/components/profile/ProfileClient';

export default async function ProfiloPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const db = getDatabase();
  const profile = db
    .prepare(
      'SELECT nome, email, livello, punti, coins, isSubscribed, subscriptionExpiresAt, createdAt FROM studente WHERE id = ?'
    )
    .get(user.id);

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header con pulsante back alla dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Impostazioni Account
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Il Mio Profilo</h1>
            <p className="text-gray-600 mt-1">
              Gestisci le tue informazioni personali e le impostazioni dell&apos;account.
            </p>
          </div>
          {/* Pulsante per tornare alla dashboard principale */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        <ProfileClient initialProfile={profile} />
      </div>
    </div>
  );
}

