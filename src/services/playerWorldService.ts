/**
 * Mobil İstemci — Oyuncu Kimliği, Veri İzolasyonu ve Personalzy API İstemcisi (Faz 5 & Faz 6)
 */

import { PersonalzyEvaluationResult } from '../features/journal/journalEngine';

export interface TestPlayerAccount {
  uid: string;
  defaultName: string;
  badgeLabel: string;
}

export const TEST_PLAYER_ACCOUNTS: TestPlayerAccount[] = [
  {
    uid: 'player_a_deniz',
    defaultName: 'Deniz Yılmaz',
    badgeLabel: 'Hesap A (Deniz)',
  },
  {
    uid: 'player_b_mert',
    defaultName: 'Mert Kaya',
    badgeLabel: 'Hesap B (Mert)',
  },
];

const DEFAULT_API_BASE_URL = 'http://10.0.2.2:8080';

/**
 * Cloud Run / yerel backend üzerinden `/v1/personalzy/reflect` çağrısı yapar.
 * Eğer sunucu kapalıysa veya ağ zaman aşımı olursa `null` döner ve istemci
 * doğrulanmış yerel Personalzy motoruyla kesintisiz devam eder.
 */
export async function requestBackendPersonalzyReflect(params: {
  uid: string;
  gameDay: number;
  grade: number;
  questionId: string;
  completedTaskIdsToday: string[];
  triggeredTrapToday: boolean;
  visitedGymToday: boolean;
  selectedQuickAnswerId: string | null;
  freeTextNote: string;
  skippedDetails: boolean;
}): Promise<{
  evaluation: PersonalzyEvaluationResult;
  source: 'gemini_live' | 'validated_fallback';
} | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(
      `${DEFAULT_API_BASE_URL}/v1/personalzy/reflect`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-Uid': params.uid,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data?.ok && data?.evaluation) {
      return {
        evaluation: data.evaluation,
        source: data.source || 'gemini_live',
      };
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
