/**
 * API Route: GET /api/missions
 * Restituisce le missioni del giorno con il progresso dello studente
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getTodayMissions } from '@/lib/missions';
import { checkMissionProgress } from '@/lib/mission-checker';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const todayMissions = getTodayMissions();
  const missionsWithProgress = todayMissions.map((mission) =>
    checkMissionProgress(user.id, mission)
  );

  return NextResponse.json({ missions: missionsWithProgress });
}

