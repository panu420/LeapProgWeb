/**
 * API Route: GET /api/admin/stats
 * Restituisce le statistiche KPI per la dashboard amministratore
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

  // 1. Statistiche Utenti
  const totalUsers = db
    .prepare('SELECT COUNT(*) as count FROM studente')
    .get() as { count: number };
  const activeUsers = db
    .prepare(
      `SELECT COUNT(DISTINCT studenteId) as count 
       FROM (
         SELECT studenteId FROM appunto
         UNION
         SELECT studenteId FROM quiz
         UNION
         SELECT studenteId FROM vero_falso
       )`
    )
    .get() as { count: number };
  const newUsersThisMonth = db
    .prepare(
      `SELECT COUNT(*) as count FROM studente 
       WHERE DATE(createdAt) >= DATE('now', '-30 days')`
    )
    .get() as { count: number };

  // 2. Statistiche Contenuti
  const totalNotes = db
    .prepare('SELECT COUNT(*) as count FROM appunto')
    .get() as { count: number };
  const totalQuizzes = db
    .prepare('SELECT COUNT(*) as count FROM quiz')
    .get() as { count: number };
  const totalVeroFalso = db
    .prepare('SELECT COUNT(*) as count FROM vero_falso')
    .get() as { count: number };
  const sharedNotes = db
    .prepare('SELECT COUNT(*) as count FROM appunto WHERE classeId IS NOT NULL')
    .get() as { count: number };

  // 3. Statistiche Classi
  const totalClasses = db
    .prepare('SELECT COUNT(*) as count FROM classe')
    .get() as { count: number };
  const totalClassMembers = db
    .prepare('SELECT COUNT(*) as count FROM studente_classe')
    .get() as { count: number };
  const avgMembersPerClass = totalClasses.count > 0
    ? Math.round((totalClassMembers.count / totalClasses.count) * 10) / 10
    : 0;

  // 4. Statistiche Gamification
  const totalPoints = db
    .prepare('SELECT SUM(punti) as total FROM studente')
    .get() as { total: number | null };
  const avgLevel = db
    .prepare('SELECT AVG(livello) as avg FROM studente')
    .get() as { avg: number | null };
  const topUsers = db
    .prepare(
      `SELECT id, nome, email, livello, punti 
       FROM studente 
       ORDER BY punti DESC, livello DESC 
       LIMIT 5`
    )
    .all() as Array<{
      id: number;
      nome: string;
      email: string;
      livello: number;
      punti: number;
    }>;

  // 5. Statistiche Attività
  const completedQuizzes = db
    .prepare(
      'SELECT COUNT(*) as count FROM quiz WHERE completedAttempts > 0'
    )
    .get() as { count: number };
  const completedVeroFalso = db
    .prepare(
      'SELECT COUNT(*) as count FROM vero_falso WHERE completedAttempts > 0'
    )
    .get() as { count: number };
  const totalQuizAttempts = db
    .prepare('SELECT SUM(completedAttempts) as total FROM quiz')
    .get() as { total: number | null };
  const totalVeroFalsoAttempts = db
    .prepare('SELECT SUM(completedAttempts) as total FROM vero_falso')
    .get() as { total: number | null };

  // 6. Statistiche Missioni
  const completedMissionsToday = db
    .prepare(
      `SELECT COUNT(*) as count FROM missione_completata 
       WHERE dataCompletamento = DATE('now')`
    )
    .get() as { count: number };
  const completedMissionsThisWeek = db
    .prepare(
      `SELECT COUNT(*) as count FROM missione_completata 
       WHERE dataCompletamento >= DATE('now', '-7 days')`
    )
    .get() as { count: number };

  // 7. Statistiche Crescita (ultimi 7 giorni)
  const notesLast7Days = db
    .prepare(
      `SELECT COUNT(*) as count FROM appunto 
       WHERE DATE(createdAt) >= DATE('now', '-7 days')`
    )
    .get() as { count: number };
  const quizzesLast7Days = db
    .prepare(
      `SELECT COUNT(*) as count FROM quiz 
       WHERE DATE(createdAt) >= DATE('now', '-7 days')`
    )
    .get() as { count: number };

  // 8. Statistiche Engagement
  const usersWithNotes = db
    .prepare('SELECT COUNT(DISTINCT studenteId) as count FROM appunto')
    .get() as { count: number };
  const usersWithQuizzes = db
    .prepare('SELECT COUNT(DISTINCT studenteId) as count FROM quiz')
    .get() as { count: number };
  const usersInClasses = db
    .prepare('SELECT COUNT(DISTINCT studenteId) as count FROM studente_classe')
    .get() as { count: number };

  // 9. Dati storici per grafici (ultimi 7 giorni)
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const notesCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM appunto 
         WHERE DATE(createdAt) = ?`
      )
      .get(dateStr) as { count: number };

    const quizzesCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM quiz 
         WHERE DATE(createdAt) = ?`
      )
      .get(dateStr) as { count: number };

    const veroFalsoCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM vero_falso 
         WHERE DATE(createdAt) = ?`
      )
      .get(dateStr) as { count: number };

    const missionsCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM missione_completata 
         WHERE dataCompletamento = ?`
      )
      .get(dateStr) as { count: number };

    dailyStats.push({
      date: dateStr,
      dayName: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      notes: notesCount.count,
      quizzes: quizzesCount.count,
      veroFalso: veroFalsoCount.count,
      missions: missionsCount.count,
    });
  }

  // 10. Distribuzione livelli utenti
  const levelDistribution = db
    .prepare(
      `SELECT livello, COUNT(*) as count 
       FROM studente 
       GROUP BY livello 
       ORDER BY livello ASC`
    )
    .all() as Array<{ livello: number; count: number }>;

  // 11. Statistiche Monetizzazione
  const totalCoins = db
    .prepare('SELECT SUM(coins) as total FROM studente')
    .get() as { total: number | null };
  const subscribedUsers = db
    .prepare(
      `SELECT COUNT(*) as count FROM studente 
       WHERE isSubscribed = 1 
       AND (subscriptionExpiresAt IS NULL OR subscriptionExpiresAt > datetime('now'))`
    )
    .get() as { count: number };
  const totalSubscribedUsers = db
    .prepare('SELECT COUNT(*) as count FROM studente WHERE isSubscribed = 1')
    .get() as { count: number };
  const avgCoinsPerUser = db
    .prepare('SELECT AVG(coins) as avg FROM studente')
    .get() as { avg: number | null };

  return NextResponse.json({
    users: {
      total: totalUsers.count,
      active: activeUsers.count,
      newThisMonth: newUsersThisMonth.count,
      inClasses: usersInClasses.count,
    },
    content: {
      notes: totalNotes.count,
      quizzes: totalQuizzes.count,
      veroFalso: totalVeroFalso.count,
      sharedNotes: sharedNotes.count,
    },
    classes: {
      total: totalClasses.count,
      totalMembers: totalClassMembers.count,
      avgMembersPerClass: avgMembersPerClass,
    },
    gamification: {
      totalPoints: totalPoints.total || 0,
      avgLevel: Math.round((avgLevel.avg || 0) * 10) / 10,
      topUsers: topUsers,
    },
    activity: {
      completedQuizzes: completedQuizzes.count,
      completedVeroFalso: completedVeroFalso.count,
      totalQuizAttempts: totalQuizAttempts.total || 0,
      totalVeroFalsoAttempts: totalVeroFalsoAttempts.total || 0,
    },
    missions: {
      completedToday: completedMissionsToday.count,
      completedThisWeek: completedMissionsThisWeek.count,
    },
    growth: {
      notesLast7Days: notesLast7Days.count,
      quizzesLast7Days: quizzesLast7Days.count,
    },
    engagement: {
      usersWithNotes: usersWithNotes.count,
      usersWithQuizzes: usersWithQuizzes.count,
      usersInClasses: usersInClasses.count,
    },
    charts: {
      dailyStats: dailyStats,
      levelDistribution: levelDistribution,
    },
    monetization: {
      totalCoins: totalCoins.total || 0,
      subscribedUsers: subscribedUsers.count,
      totalSubscribedUsers: totalSubscribedUsers.count,
      avgCoinsPerUser: Math.round((avgCoinsPerUser.avg || 0) * 10) / 10,
    },
  });
}

