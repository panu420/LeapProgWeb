/**
 * Sistema di Missioni Giornaliere
 * Le missioni ruotano ogni giorno e assegnano punti bonus
 */

export interface Mission {
  id: string;
  title: string;
  description: string;
  type:
    | 'complete_quiz'
    | 'complete_vero_falso'
    | 'create_note'
    | 'edit_note'
    | 'earn_points';
  target: number; // Numero target (es. 3 quiz, 100 punti)
  pointsReward: number; // Punti bonus per completamento
  coinReward?: number; // Coin bonus per completamento (solo per missioni difficili)
}

/**
 * Lista di missioni disponibili che ruotano giornalmente
 * Le missioni vengono selezionate in base al giorno della settimana
 */
export const DAILY_MISSIONS: Mission[] = [
  {
    id: 'quiz_1',
    title: 'Completa 1 Quiz',
    description: 'Completa almeno 1 quiz oggi per guadagnare punti bonus',
    type: 'complete_quiz',
    target: 1,
    pointsReward: 20,
  },
  {
    id: 'quiz_3',
    title: 'Completa 3 Quiz',
    description: 'Completa almeno 3 quiz oggi per una ricompensa maggiore',
    type: 'complete_quiz',
    target: 3,
    pointsReward: 50,
    coinReward: 20, // 3 quiz = 15 coin necessari, ricompensa 20 coin (profitto +5)
  },
  {
    id: 'vero_falso_1',
    title: 'Completa 1 Vero/Falso',
    description: 'Completa almeno 1 esercizio Vero/Falso oggi',
    type: 'complete_vero_falso',
    target: 1,
    pointsReward: 20,
  },
  {
    id: 'vero_falso_3',
    title: 'Completa 3 Vero/Falso',
    description: 'Completa almeno 3 esercizi Vero/Falso oggi',
    type: 'complete_vero_falso',
    target: 3,
    pointsReward: 50,
    coinReward: 20, // 3 vero/falso = 15 coin necessari, ricompensa 20 coin (profitto +5)
  },
  {
    id: 'create_note',
    title: 'Crea un Appunto',
    description: 'Crea un nuovo appunto oggi (manuale o con AI)',
    type: 'create_note',
    target: 1,
    pointsReward: 15,
  },
  {
    id: 'edit_note',
    title: 'Modifica un Appunto',
    description: 'Modifica almeno un appunto esistente oggi',
    type: 'edit_note',
    target: 1,
    pointsReward: 15,
  },
  {
    id: 'earn_50_points',
    title: 'Guadagna 50 Punti',
    description: 'Guadagna almeno 50 punti oggi completando quiz o esercizi',
    type: 'earn_points',
    target: 50,
    pointsReward: 25,
    coinReward: 10, // Può richiedere ~5 quiz/vero-falso = 25 coin, ricompensa 10 coin
  },
  {
    id: 'earn_100_points',
    title: 'Guadagna 100 Punti',
    description: 'Guadagna almeno 100 punti oggi per una ricompensa speciale',
    type: 'earn_points',
    target: 100,
    pointsReward: 60,
    coinReward: 30, // Può richiedere ~10 quiz/vero-falso = 50 coin, ricompensa 30 coin
  },
];

/**
 * Ottiene le missioni del giorno corrente
 * Usa il giorno della settimana (0-6) per selezionare missioni diverse
 */
export function getTodayMissions(): Mission[] {
  const dayOfWeek = new Date().getDay(); // 0 = Domenica, 6 = Sabato
  const missionsPerDay = 3; // Mostriamo 3 missioni al giorno

  // Seleziona missioni in base al giorno della settimana
  const startIndex = (dayOfWeek * missionsPerDay) % DAILY_MISSIONS.length;
  const selectedMissions: Mission[] = [];

  for (let i = 0; i < missionsPerDay; i++) {
    const index = (startIndex + i) % DAILY_MISSIONS.length;
    selectedMissions.push(DAILY_MISSIONS[index]);
  }

  return selectedMissions;
}

/**
 * Verifica se una missione è stata completata oggi
 */
export function isMissionCompletedToday(
  completedAt: string | null
): boolean {
  if (!completedAt) return false;
  const completed = new Date(completedAt);
  const today = new Date();
  return (
    completed.getDate() === today.getDate() &&
    completed.getMonth() === today.getMonth() &&
    completed.getFullYear() === today.getFullYear()
  );
}

