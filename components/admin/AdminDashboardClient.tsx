/**
 * Client Component per la Dashboard Amministratore
 * Gestisce il fetch delle statistiche e la visualizzazione delle KPI
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GrowthChart from './charts/GrowthChart';
import TopUsersChart from './charts/TopUsersChart';
import ContentDistributionChart from './charts/ContentDistributionChart';
import LevelDistributionChart from './charts/LevelDistributionChart';
import ActivityChart from './charts/ActivityChart';

interface AdminStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    inClasses: number;
  };
  content: {
    notes: number;
    quizzes: number;
    veroFalso: number;
    sharedNotes: number;
  };
  classes: {
    total: number;
    totalMembers: number;
    avgMembersPerClass: number;
  };
  gamification: {
    totalPoints: number;
    avgLevel: number;
    topUsers: Array<{
      id: number;
      nome: string;
      email: string;
      livello: number;
      punti: number;
    }>;
  };
  activity: {
    completedQuizzes: number;
    completedVeroFalso: number;
    totalQuizAttempts: number;
    totalVeroFalsoAttempts: number;
  };
  missions: {
    completedToday: number;
    completedThisWeek: number;
  };
  growth: {
    notesLast7Days: number;
    quizzesLast7Days: number;
  };
  engagement: {
    usersWithNotes: number;
    usersWithQuizzes: number;
    usersInClasses: number;
  };
  charts: {
    dailyStats: Array<{
      date: string;
      dayName: string;
      notes: number;
      quizzes: number;
      veroFalso: number;
      missions: number;
    }>;
    levelDistribution: Array<{
      livello: number;
      count: number;
    }>;
  };
  monetization: {
    totalCoins: number;
    subscribedUsers: number;
    totalSubscribedUsers: number;
    avgCoinsPerUser: number;
  };
}

/**
 * Componente Card per visualizzare una KPI
 */
function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span
            className={`ml-2 text-sm font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch delle statistiche
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Errore nel caricamento delle statistiche');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    // Aggiorna le statistiche ogni 30 secondi
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ricarica
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Amministratore
            </h1>
            <p className="mt-2 text-gray-600">
              Panoramica delle statistiche e KPI della piattaforma
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Torna alla Dashboard
          </Link>
        </div>
      </div>

      {/* KPI Cards - Utenti */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Utenti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Totale Utenti"
            value={stats.users.total}
            subtitle="Utenti registrati"
            icon="👥"
          />
          <KPICard
            title="Utenti Attivi"
            value={stats.users.active}
            subtitle="Hanno creato contenuti"
            icon="✅"
          />
          <KPICard
            title="Nuovi Questo Mese"
            value={stats.users.newThisMonth}
            subtitle="Ultimi 30 giorni"
            icon="🆕"
          />
          <KPICard
            title="Utenti in Classi"
            value={stats.users.inClasses}
            subtitle="Membri di almeno una classe"
            icon="🏫"
          />
        </div>
      </div>

      {/* KPI Cards - Contenuti */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenuti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Appunti"
            value={stats.content.notes}
            subtitle="Totale appunti creati"
            icon="📚"
          />
          <KPICard
            title="Quiz"
            value={stats.content.quizzes}
            subtitle="Totale quiz creati"
            icon="❓"
          />
          <KPICard
            title="Vero/Falso"
            value={stats.content.veroFalso}
            subtitle="Totale esercizi creati"
            icon="✅"
          />
          <KPICard
            title="Appunti Condivisi"
            value={stats.content.sharedNotes}
            subtitle="Nelle classi"
            icon="🔗"
          />
        </div>
        {/* Grafico distribuzione contenuti */}
        <ContentDistributionChart
          notes={stats.content.notes}
          quizzes={stats.content.quizzes}
          veroFalso={stats.content.veroFalso}
        />
      </div>

      {/* KPI Cards - Classi */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Classi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Totale Classi"
            value={stats.classes.total}
            subtitle="Classi create"
            icon="🏫"
          />
          <KPICard
            title="Totale Membri"
            value={stats.classes.totalMembers}
            subtitle="Iscrizioni totali"
            icon="👥"
          />
          <KPICard
            title="Media Membri/Classe"
            value={stats.classes.avgMembersPerClass}
            subtitle="Membri per classe"
            icon="📊"
          />
        </div>
      </div>

      {/* KPI Cards - Gamification */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Gamification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <KPICard
            title="Punti Totali"
            value={stats.gamification.totalPoints.toLocaleString()}
            subtitle="Punti accumulati da tutti gli utenti"
            icon="⭐"
          />
          <KPICard
            title="Livello Medio"
            value={stats.gamification.avgLevel}
            subtitle="Livello medio degli utenti"
            icon="📈"
          />
        </div>

        {/* Grafici Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopUsersChart users={stats.gamification.topUsers} />
          <LevelDistributionChart data={stats.charts.levelDistribution} />
        </div>
      </div>

      {/* KPI Cards - Attività */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attività</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Quiz Completati"
            value={stats.activity.completedQuizzes}
            subtitle="Quiz con almeno un tentativo"
            icon="✅"
          />
          <KPICard
            title="Vero/Falso Completati"
            value={stats.activity.completedVeroFalso}
            subtitle="Esercizi con almeno un tentativo"
            icon="✅"
          />
          <KPICard
            title="Tentativi Quiz"
            value={stats.activity.totalQuizAttempts}
            subtitle="Totale tentativi quiz"
            icon="🔄"
          />
          <KPICard
            title="Tentativi Vero/Falso"
            value={stats.activity.totalVeroFalsoAttempts}
            subtitle="Totale tentativi esercizi"
            icon="🔄"
          />
        </div>
        {/* Grafico attività */}
        <ActivityChart
          completedQuizzes={stats.activity.completedQuizzes}
          completedVeroFalso={stats.activity.completedVeroFalso}
          totalQuizAttempts={stats.activity.totalQuizAttempts}
          totalVeroFalsoAttempts={stats.activity.totalVeroFalsoAttempts}
        />
      </div>

      {/* KPI Cards - Missioni */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Missioni</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Completate Oggi"
            value={stats.missions.completedToday}
            subtitle="Missioni completate oggi"
            icon="🎯"
          />
          <KPICard
            title="Completate Questa Settimana"
            value={stats.missions.completedThisWeek}
            subtitle="Ultimi 7 giorni"
            icon="📅"
          />
        </div>
      </div>

      {/* Grafico Crescita */}
      <div className="mb-8">
        <GrowthChart data={stats.charts.dailyStats} />
      </div>

      {/* KPI Cards - Engagement */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Utenti con Appunti"
            value={stats.engagement.usersWithNotes}
            subtitle="Hanno creato almeno un appunto"
            icon="📝"
          />
          <KPICard
            title="Utenti con Quiz"
            value={stats.engagement.usersWithQuizzes}
            subtitle="Hanno creato almeno un quiz"
            icon="❓"
          />
          <KPICard
            title="Utenti in Classi"
            value={stats.engagement.usersInClasses}
            subtitle="Membri di almeno una classe"
            icon="🏫"
          />
        </div>
      </div>

      {/* KPI Cards - Monetizzazione */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monetizzazione</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Coin Totali"
            value={stats.monetization.totalCoins.toLocaleString()}
            subtitle="Coin disponibili nel sistema"
            icon="💰"
          />
          <KPICard
            title="Utenti Abbonati"
            value={stats.monetization.subscribedUsers}
            subtitle="Abbonamenti attivi"
            icon="⭐"
          />
          <KPICard
            title="Totale Abbonati"
            value={stats.monetization.totalSubscribedUsers}
            subtitle="Utenti che hanno fatto abbonamento"
            icon="👑"
          />
          <KPICard
            title="Media Coin/Utente"
            value={stats.monetization.avgCoinsPerUser}
            subtitle="Coin medi per utente"
            icon="📊"
          />
        </div>
      </div>

      {/* Sezione Acquisti */}
      <PurchasesSection />

      {/* Sezione Gestione Utenti */}
      <UserManagementSection />
    </div>
  );
}

/**
 * Sezione per la gestione degli utenti
 * Permette all'admin di vedere tutti gli utenti, i loro contenuti e eliminare appunti inappropriati
 */
function UserManagementSection() {
  const [users, setUsers] = useState<Array<{
    id: number;
    email: string;
    nome: string;
    livello: number;
    punti: number;
    coins: number;
    isSubscribed: number;
    subscriptionExpiresAt: string | null;
    createdAt: string;
    totalAppunti: number;
    totalQuiz: number;
    totalVeroFalso: number;
    totalClassi: number;
  }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<{
    studente: {
      id: number;
      email: string;
      nome: string;
      livello: number;
      punti: number;
      coins: number;
      isSubscribed: number;
      subscriptionExpiresAt: string | null;
      createdAt: string;
    };
    appunti: Array<{
      id: number;
      titolo: string;
      contenuto: string;
      classeId: number | null;
      sharedAt: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    quiz: Array<{
      id: number;
      titolo: string;
      difficolta: string;
      totalQuestions: number;
      lastScore: number | null;
      bestScore: number | null;
      completedAttempts: number;
      createdAt: string;
    }>;
    veroFalso: Array<{
      id: number;
      titolo: string;
      difficolta: string;
      totalQuestions: number;
      lastScore: number | null;
      bestScore: number | null;
      completedAttempts: number;
      createdAt: string;
    }>;
    classi: Array<{
      id: number;
      nome: string;
      codice: string;
      creatoreId: number;
      createdAt: string;
      joinedAt: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica la lista degli utenti al mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Errore nel caricamento degli utenti');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Carica i dettagli di un utente quando viene selezionato
  useEffect(() => {
    if (selectedUserId) {
      async function fetchUserDetails() {
        setLoadingDetails(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/users/${selectedUserId}`);
          if (!response.ok) {
            throw new Error('Errore nel caricamento dei dettagli utente');
          }
          const data = await response.json();
          setUserDetails(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        } finally {
          setLoadingDetails(false);
        }
      }
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
  }, [selectedUserId]);

  // Funzione per eliminare un appunto
  const handleDeleteAppunto = async (appuntoId: number, titolo: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'appunto "${titolo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appunti/${appuntoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore nell\'eliminazione');
      }

      // Ricarica i dettagli dell'utente dopo l'eliminazione
      if (selectedUserId) {
        const detailsResponse = await fetch(`/api/admin/users/${selectedUserId}`);
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          setUserDetails(detailsData);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Gestione Utenti
      </h2>

      {/* Layout a due colonne quando un utente è selezionato, altrimenti a colonna singola */}
      <div className={selectedUserId ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
        {/* Lista Utenti */}
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${selectedUserId ? '' : 'mb-6'}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lista Utenti ({users.length})
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento utenti...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ricarica
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livello
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punti
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appunti
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vero/Falso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={selectedUserId === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.nome}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.livello}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.punti}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.totalAppunti}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.totalQuiz}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.totalVeroFalso}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.totalClassi}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            setSelectedUserId(
                              selectedUserId === user.id ? null : user.id
                            )
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        >
                          {selectedUserId === user.id ? 'Nascondi' : 'Dettagli'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dettagli Utente Selezionato */}
        {selectedUserId && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Dettagli Utente
            </h3>
            <button
              onClick={() => setSelectedUserId(null)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Chiudi
            </button>
          </div>

          {loadingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento dettagli...</p>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Info Utente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Informazioni</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{userDetails.studente.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Livello:</span>
                    <p className="font-medium">{userDetails.studente.livello}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Punti:</span>
                    <p className="font-medium">{userDetails.studente.punti}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Coin:</span>
                    <p className="font-medium">{userDetails.studente.coins}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Abbonato:</span>
                    <p className="font-medium">
                      {userDetails.studente.isSubscribed ? 'Sì' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Registrato:</span>
                    <p className="font-medium">
                      {new Date(userDetails.studente.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appunti */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Appunti ({userDetails.appunti.length})
                </h4>
                {userDetails.appunti.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nessun appunto</p>
                ) : (
                  <div className="space-y-2">
                    {userDetails.appunti.map((appunto) => (
                      <div
                        key={appunto.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {appunto.titolo}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {appunto.contenuto}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>
                                Creato:{' '}
                                {new Date(appunto.createdAt).toLocaleDateString('it-IT')}
                              </span>
                              {appunto.classeId && (
                                <span className="text-blue-600">Condiviso in classe</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteAppunto(appunto.id, appunto.titolo)
                            }
                            className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs whitespace-nowrap"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Quiz ({userDetails.quiz.length})
                </h4>
                {userDetails.quiz.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nessun quiz</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userDetails.quiz.map((q) => (
                      <div
                        key={q.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <h5 className="font-medium text-gray-900">{q.titolo}</h5>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p>Difficoltà: {q.difficolta}</p>
                          <p>Domande: {q.totalQuestions}</p>
                          <p>Tentativi: {q.completedAttempts}</p>
                          {q.bestScore !== null && (
                            <p>Miglior punteggio: {q.bestScore}/{q.totalQuestions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vero/Falso */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Vero/Falso ({userDetails.veroFalso.length})
                </h4>
                {userDetails.veroFalso.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nessun esercizio</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userDetails.veroFalso.map((vf) => (
                      <div
                        key={vf.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <h5 className="font-medium text-gray-900">{vf.titolo}</h5>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p>Difficoltà: {vf.difficolta}</p>
                          <p>Affermazioni: {vf.totalQuestions}</p>
                          <p>Tentativi: {vf.completedAttempts}</p>
                          {vf.bestScore !== null && (
                            <p>Miglior punteggio: {vf.bestScore}/{vf.totalQuestions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Classi */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Classi ({userDetails.classi.length})
                </h4>
                {userDetails.classi.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nessuna classe</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userDetails.classi.map((classe) => (
                      <div
                        key={classe.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <h5 className="font-medium text-gray-900">{classe.nome}</h5>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p>Codice: {classe.codice}</p>
                          <p>
                            Iscritto:{' '}
                            {new Date(classe.joinedAt).toLocaleDateString('it-IT')}
                          </p>
                          {classe.creatoreId === userDetails.studente.id && (
                            <span className="text-blue-600">Creatore</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
}

/**
 * Sezione per visualizzare tutti gli acquisti effettuati
 */
function PurchasesSection() {
  const [acquisti, setAcquisti] = useState<Array<{
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
  }>>([]);
  const [statistiche, setStatistiche] = useState<{
    totalAcquisti: number;
    totaleRicavi: number;
    totaleCoinVenduti: number;
    totaleAbbonamenti: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAcquisti() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/purchases');
        if (!response.ok) {
          throw new Error('Errore nel caricamento degli acquisti');
        }
        const data = await response.json();
        setAcquisti(data.acquisti);
        setStatistiche(data.statistiche);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }
    fetchAcquisti();
    // Aggiorna ogni 30 secondi
    const interval = setInterval(fetchAcquisti, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Acquisti</h2>

      {/* Statistiche Acquisti */}
      {statistiche && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Totale Acquisti"
            value={statistiche.totalAcquisti}
            subtitle="Acquisti effettuati"
            icon="🛒"
          />
          <KPICard
            title="Totale Ricavi"
            value={`€${statistiche.totaleRicavi.toFixed(2)}`}
            subtitle="Ricavi totali"
            icon="💵"
          />
          <KPICard
            title="Coin Venduti"
            value={statistiche.totaleCoinVenduti.toLocaleString()}
            subtitle="Coin venduti totali"
            icon="🪙"
          />
          <KPICard
            title="Abbonamenti Venduti"
            value={statistiche.totaleAbbonamenti}
            subtitle="Abbonamenti venduti"
            icon="⭐"
          />
        </div>
      )}

      {/* Tabella Acquisti */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Elenco Acquisti ({acquisti.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Caricamento acquisti...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ricarica
            </button>
          </div>
        ) : acquisti.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun acquisto effettuato</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prodotto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dettagli
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe Session
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {acquisti.map((acquisto) => (
                  <tr key={acquisto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(acquisto.createdAt).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {acquisto.nomeUtente}
                      </div>
                      <div className="text-sm text-gray-500">
                        {acquisto.emailUtente}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {acquisto.nomeProdotto}
                      </div>
                      <div className="text-xs text-gray-500">
                        {acquisto.tipoProdotto}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      €{acquisto.importoEuro.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {acquisto.coinsAggiunti !== null && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          +{acquisto.coinsAggiunti} coin
                        </span>
                      )}
                      {acquisto.mesiAbbonamento !== null && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-1">
                          {acquisto.mesiAbbonamento} {acquisto.mesiAbbonamento === 1 ? 'mese' : 'mesi'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {acquisto.stripeSessionId.substring(0, 20)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

