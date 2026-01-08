/**
 * API Route: POST /api/missions/complete
 * Marca una missione come completata e assegna punti bonus
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getTodayMissions } from '@/lib/missions';
import { completeMission } from '@/lib/mission-checker';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { missionId } = await request.json();
  if (!missionId) {
    return NextResponse.json(
      { error: 'missionId obbligatorio' },
      { status: 400 }
    );
  }

  // Verifica che la missione esista nelle missioni di oggi
  const todayMissions = getTodayMissions();
  const mission = todayMissions.find((m) => m.id === missionId);

  if (!mission) {
    return NextResponse.json(
      { error: 'Missione non trovata o non disponibile oggi' },
      { status: 404 }
    );
  }

  const result = completeMission(user.id, missionId, mission.pointsReward);

  if (!result.success) {
    if (result.alreadyCompleted) {
      return NextResponse.json(
        { error: 'Missione già completata oggi' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Errore nel completamento' },
      { status: 500 }
    );
  }

  // Ottieni i coin reward dalla risposta di completeMission
  const coinReward = result.coinReward || 
    (mission.coinReward && mission.coinReward > 0 ? mission.coinReward : undefined);

  return NextResponse.json({
    success: true,
    pointsReward: mission.pointsReward,
    coinReward,
  });
}

