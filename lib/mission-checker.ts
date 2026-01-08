/**
 * Logica per verificare il completamento delle missioni
 */

import { getDatabase } from './db';
import { Mission, getTodayMissions } from './missions';
import { awardPoints } from './points';
import { addCoins, MISSION_COIN_REWARDS } from './coins';

interface MissionProgress {
  mission: Mission;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  coinReward?: number; // Coin guadagnati completando questa missione
}

/**
 * Verifica il progresso di una missione per uno studente oggi
 */
export function checkMissionProgress(
  studenteId: number,
  mission: Mission
): MissionProgress {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Verifica se già completata oggi
  const completed = db
    .prepare(
      `SELECT dataCompletamento FROM missione_completata 
       WHERE studenteId = ? AND missioneId = ? AND dataCompletamento = ?`
    )
    .get(studenteId, mission.id, today) as { dataCompletamento: string } | undefined;

  let progress = 0;

  switch (mission.type) {
    case 'complete_quiz':
      // Conta quiz completati oggi usando lastCompletedAt se disponibile, altrimenti usa createdAt
      const quizResult = db
        .prepare(
          `SELECT COUNT(*) as count FROM quiz 
           WHERE studenteId = ? 
           AND (
             (lastCompletedAt IS NOT NULL AND DATE(lastCompletedAt) = ?) OR
             (lastCompletedAt IS NULL AND DATE(createdAt) = ? AND completedAttempts > 0)
           )`
        )
        .get(studenteId, today, today) as { count: number };
      progress = quizResult.count;
      break;

    case 'complete_vero_falso':
      // Stessa logica per vero/falso
      const vfResult = db
        .prepare(
          `SELECT COUNT(*) as count FROM vero_falso 
           WHERE studenteId = ? 
           AND (
             (lastCompletedAt IS NOT NULL AND DATE(lastCompletedAt) = ?) OR
             (lastCompletedAt IS NULL AND DATE(createdAt) = ? AND completedAttempts > 0)
           )`
        )
        .get(studenteId, today, today) as { count: number };
      progress = vfResult.count;
      break;

    case 'create_note':
      const noteResult = db
        .prepare(
          `SELECT COUNT(*) as count FROM appunto 
           WHERE studenteId = ? AND DATE(createdAt) = ?`
        )
        .get(studenteId, today) as { count: number };
      progress = noteResult.count;
      break;

    case 'edit_note':
      const editResult = db
        .prepare(
          `SELECT COUNT(*) as count FROM appunto 
           WHERE studenteId = ? 
           AND DATE(updatedAt) = ? 
           AND updatedAt != createdAt`
        )
        .get(studenteId, today) as { count: number };
      progress = editResult.count;
      break;

    case 'earn_points':
      // Calcola punti guadagnati oggi da quiz e vero/falso completati oggi
      // Usa lastScore * 10 (punti per risposta corretta) per tentativi completati oggi
      // Conta anche i nuovi tentativi di quiz/vero-falso creati in giorni precedenti
      const quizPoints = db
        .prepare(
          `SELECT COALESCE(SUM(lastScore * 10), 0) as points 
           FROM quiz 
           WHERE studenteId = ? 
           AND (
             (lastCompletedAt IS NOT NULL AND DATE(lastCompletedAt) = ?) OR
             (lastCompletedAt IS NULL AND DATE(createdAt) = ? AND completedAttempts > 0)
           )
           AND lastScore IS NOT NULL 
           AND completedAttempts > 0`
        )
        .get(studenteId, today, today) as { points: number };
      
      const vfPoints = db
        .prepare(
          `SELECT COALESCE(SUM(lastScore * 10), 0) as points 
           FROM vero_falso 
           WHERE studenteId = ? 
           AND (
             (lastCompletedAt IS NOT NULL AND DATE(lastCompletedAt) = ?) OR
             (lastCompletedAt IS NULL AND DATE(createdAt) = ? AND completedAttempts > 0)
           )
           AND lastScore IS NOT NULL 
           AND completedAttempts > 0`
        )
        .get(studenteId, today, today) as { points: number };
      
      progress = (quizPoints.points || 0) + (vfPoints.points || 0);
      break;
  }

  // Ottieni i coin reward per questa missione
  const coinReward = MISSION_COIN_REWARDS[mission.id as keyof typeof MISSION_COIN_REWARDS] || mission.coinReward || 0;

  return {
    mission: {
      ...mission,
      coinReward: coinReward > 0 ? coinReward : undefined,
    },
    progress: Math.min(progress, mission.target),
    completed: completed !== undefined,
    completedAt: completed?.dataCompletamento || null,
    coinReward: coinReward > 0 ? coinReward : undefined,
  };
}

/**
 * Marca una missione come completata e assegna i punti bonus e coin
 */
export function completeMission(
  studenteId: number,
  missionId: string,
  pointsReward: number
): { success: boolean; alreadyCompleted: boolean; coinReward?: number } {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Verifica se già completata
  const existing = db
    .prepare(
      `SELECT id FROM missione_completata 
       WHERE studenteId = ? AND missioneId = ? AND dataCompletamento = ?`
    )
    .get(studenteId, missionId, today);

  if (existing) {
    return { success: false, alreadyCompleted: true };
  }

  // Inserisci completamento
  db.prepare(
    `INSERT INTO missione_completata (studenteId, missioneId, dataCompletamento)
     VALUES (?, ?, ?)`
  ).run(studenteId, missionId, today);

  // Assegna punti bonus
  awardPoints(studenteId, pointsReward);

  // Assegna coin bonus se disponibili per questa missione
  // Prima controlla MISSION_COIN_REWARDS, poi il campo coinReward della missione
  const coinReward = MISSION_COIN_REWARDS[missionId as keyof typeof MISSION_COIN_REWARDS];
  if (coinReward && coinReward > 0) {
    addCoins(studenteId, coinReward);
    return { success: true, alreadyCompleted: false, coinReward };
  }

  // Se non c'è in MISSION_COIN_REWARDS, controlla se la missione ha coinReward
  const todayMissions = getTodayMissions();
  const mission = todayMissions.find((m) => m.id === missionId);
  if (mission?.coinReward && mission.coinReward > 0) {
    addCoins(studenteId, mission.coinReward);
    return { success: true, alreadyCompleted: false, coinReward: mission.coinReward };
  }

  return { success: true, alreadyCompleted: false };
}

