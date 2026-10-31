/**
 * Mobil İstemci — Oyuncu Kimliği, 3 Seed Kullanıcı, Token Kotası, Veri İzolasyonu ve Personalzy / NPC Chat API İstemcisi
 */

import { PersonalzyEvaluationResult } from '../features/journal/journalEngine';
import {
  NpcChatResult,
  NpcId,
  NpcRelationship,
  PlayerCommunicationStyle,
} from '../features/social/npcRelationshipEngine';
import { FloorThemeId } from '../features/theme/adaptiveFloorTheme';

export interface SeedPlayerAccount {
  uid: string;
  email: string;
  password: string;
  defaultName: string;
  username: string;
  grade: 1 | 2 | 3 | 4;
  badgeLabel: string;
  initialTheme: FloorThemeId;
  dailyTokenLimit: number;
  initialTokensUsed: number;
}

export type TestPlayerAccount = SeedPlayerAccount;

/**
 * Sistemde hazır gömülü (seed) 3 farklı öğrenci hesabı.
 * Her hesabın kendi token kotası, sınıfı, kullanıcı adı ve başlangıç zemin teması vardır.
 */
export const TEST_PLAYER_ACCOUNTS: SeedPlayerAccount[] = [
  {
    uid: 'player_a_deniz',
    email: 'deniz@zombiecoder.edu.tr',
    password: 'Zombie123!',
    defaultName: 'Deniz Yılmaz',
    username: 'deniz_dev',
    grade: 1,
    badgeLabel: 'Deniz (@deniz_dev • 1. Sınıf)',
    initialTheme: 'terminal_matrix',
    dailyTokenLimit: 1000,
    initialTokensUsed: 120,
  },
  {
    uid: 'player_b_mert',
    email: 'mert@zombiecoder.edu.tr',
    password: 'Zombie123!',
    defaultName: 'Mert Kaya',
    username: 'mert_arch',
    grade: 2,
    badgeLabel: 'Mert (@mert_arch • 2. Sınıf)',
    initialTheme: 'blueprint_cyber',
    dailyTokenLimit: 1000,
    initialTokensUsed: 240,
  },
  {
    uid: 'player_c_zeynep',
    email: 'zeynep@zombiecoder.edu.tr',
    password: 'Zombie123!',
    defaultName: 'Zeynep Demir',
    username: 'zeynep_ai',
    grade: 3,
    badgeLabel: 'Zeynep (@zeynep_ai • 3. Sınıf)',
    initialTheme: 'necrosis_purple',
    dailyTokenLimit: 1000,
    initialTokensUsed: 180,
  },
];

const DEFAULT_API_BASE_URL = 'http://10.0.2.2:8080';

/** Backend Gemini için 20 sn ayırır; ağ gecikmesi için pay bırakılır. */
const NPC_CHAT_CLIENT_TIMEOUT_MS = 30000;

/**
 * Backend üzerinden `/v1/npc/chat` çağrısı yapar. NPC cevabı her zaman sunucuda
 * Gemini ile üretilir; istemcide yedek cevap üretilmez. Sunucuya ulaşılamazsa
 * `{ result: null, error }` döner ve arayüz bunu sistem bildirimi olarak gösterir.
 */
export async function requestBackendNpcChat(params: {
  uid: string;
  npcId: NpcId;
  relationship: NpcRelationship;
  playerMessage: string;
  playerName: string;
  playerStyle: PlayerCommunicationStyle;
  gameDay: number;
  clock: string;
  playerLocationLabel: string;
  activeTaskTitle: string | null;
}): Promise<{ result: NpcChatResult | null; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NPC_CHAT_CLIENT_TIMEOUT_MS);
  const { uid, ...body } = params;

  try {
    const response = await fetch(`${DEFAULT_API_BASE_URL}/v1/npc/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Player-Uid': uid,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { result: null, error: `Sunucu hatası (${response.status}).` };
    }

    const data = await response.json();
    if (data?.ok && data?.result) {
      return { result: data.result as NpcChatResult };
    }
    return { result: null, error: 'Sunucudan geçersiz yanıt geldi.' };
  } catch (err: any) {
    return {
      result: null,
      error:
        err?.name === 'AbortError'
          ? 'Sunucu zamanında yanıt vermedi.'
          : 'Sunucuya ulaşılamadı.',
    };
  } finally {
    clearTimeout(timer);
  }
}

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
