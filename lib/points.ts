import { getDatabase } from './db';

const POINTS_PER_LEVEL = 100;

export interface AwardPointsResult {
  newPoints: number;
  newLevel: number;
}

/**
 * Assegna punti allo studente e aggiorna il livello in base alla soglia definita.
 */
export function awardPoints(
  studenteId: number,
  pointsToAdd: number
): AwardPointsResult {
  const db = getDatabase();
  const current = db
    .prepare('SELECT punti, livello FROM studente WHERE id = ?')
    .get(studenteId) as { punti: number; livello: number } | undefined;

  if (!current) {
    throw new Error('Studente non trovato');
  }

  const updatedPoints = current.punti + pointsToAdd;
  const updatedLevel = Math.floor(updatedPoints / POINTS_PER_LEVEL) + 1;

  db.prepare('UPDATE studente SET punti = ?, livello = ? WHERE id = ?').run(
    updatedPoints,
    updatedLevel,
    studenteId
  );

  return {
    newPoints: updatedPoints,
    newLevel: updatedLevel,
  };
}

