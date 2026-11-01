/**
 * Mobil İstemci — Oyuncu Kimliği, 3 Seed Kullanıcı, Token Kotası, Veri İzolasyonu ve Personalzy / NPC Chat API İstemcisi
 */

import { PersonalzyEvaluationResult } from '../features/journal/journalEngine';
import {
  NPC_PERSONAS,
  NpcChatResult,
  NpcId,
  NpcRelationship,
  PlayerCommunicationStyle,
  applyNpcTurnToRelationship,
  buildInCharacterFallbackResult,
  computeGameplayEffects,
  normalizeNpcModelOutput,
} from '../features/social/npcRelationshipEngine';
import { FloorThemeId } from '../features/theme/adaptiveFloorTheme';
import { CLIENT_AI_CONFIG } from '../config/clientAiConfig';

export interface SeedPlayerAccount {
  uid: string;
  email: string;
  password: string;
  defaultName: string;
  username: string;
  grade: 1 | 2 | 3 | 4;
  gender?: 'male' | 'female';
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
    gender: 'female',
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
    gender: 'male',
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
    gender: 'female',
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
 * Personalzy gün sonu analizi için istemci bekleme süresi.
 * Lite modelle birkaç saniyede döner; ağ/soğuk başlatma gecikmesi için pay bırakılır.
 * Süre aşılırsa istemci doğrulanmış yerel Personalzy motoruna düşer.
 */
const PERSONALZY_CLIENT_TIMEOUT_MS = 25000;

/**
 * İstemci tarafında doğrudan OpenAI (gpt-4o-mini) çağrısı yapar.
 * Backend sunucusu (localhost:8080) çalışmadığında veya çevrimdışıyken
 * anında devreye girerek canlı yapay zeka yanıtını kesintisiz sağlar.
 */
async function requestDirectOpenAiNpcChat(params: {
  uid: string;
  npcId: NpcId;
  relationship: NpcRelationship;
  playerMessage: string;
  playerName: string;
  playerStyle: PlayerCommunicationStyle;
  gameDay: number;
}): Promise<NpcChatResult | null> {
  const persona = NPC_PERSONAS[params.npcId];
  const systemPrompt = `Sen ${persona.name} adında bir karaktersin.
Rolün: ${persona.roleTitle}.
Karakter Özelliklerin: ${persona.personalityTraits.join(', ')}.
Uzmanlık Alanın: ${persona.expertise}.
Konuşma Tarzın: ${persona.speechStyle}.
Sınırların: ${persona.boundaries}.

Muhatabın olan oyuncunun adı: ${params.playerName}. Konuşma tarzı: ${params.playerStyle}.
SADECE aşağıdaki JSON formatında geçerli bir JSON nesnesi döndür:
{
  "npcReply": "Karakterinin ağzından doğal Türkçe cevap (en fazla 2-3 cümle)",
  "intent": "greeting | small_talk | banter_or_joke | provocation | venting_or_low_mood | opinion_question | memory_recall | project_talk | expertise_request | ambiguous",
  "familiarityDelta": 1,
  "trustDelta": 0,
  "relationshipReason": "Kısa Türkçe gerekçe",
  "memoryToConfirm": null,
  "sharedExperienceToAdd": null,
  "relationshipSummaryUpdate": null
}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_AI_CONFIG.timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLIENT_AI_CONFIG.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: CLIENT_AI_CONFIG.openAiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: params.playerMessage },
        ],
        max_tokens: 150,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return null;
    }

    const data: any = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return null;
    }

    const normalized = normalizeNpcModelOutput(rawContent);
    if (!normalized.valid || !normalized.turn) {
      return null;
    }

    const applied = applyNpcTurnToRelationship({
      relationship: params.relationship,
      playerMessage: params.playerMessage,
      turn: normalized.turn,
      gameDay: params.gameDay,
    });

    return {
      status: 'ok',
      npcReply: normalized.turn.npcReply,
      detectedIntent: normalized.turn.intent,
      updatedRelationship: applied.relationship,
      relationshipChange: {
        familiarityDelta: applied.appliedFamiliarityDelta,
        trustDelta: applied.appliedTrustDelta,
        reason: normalized.turn.relationshipReason,
      },
      gameplayEffects: computeGameplayEffects({
        npcId: params.npcId,
        intent: normalized.turn.intent,
        appliedFamiliarityDelta: applied.appliedFamiliarityDelta,
      }),
      isFallback: false,
      source: 'openai_fallback',
      model: CLIENT_AI_CONFIG.openAiModel,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * NPC sohbet çağrısı:
 * 1. Önce yerel backend sunucusunu dener.
 * 2. Sunucu kapalıysa veya hata verirse anında doğrudan OpenAI (gpt-4o-mini) çağrısı yapar.
 * 3. İnternet yoksa ilgili karakterin kişiliğine uygun hazır yerel yanıtı (offline mock) döndürür.
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
  const { uid, ...body } = params;

  // 1. ADIM: Yerel / Cloud Run Backend Denemesi
  const endpoints = [
    `${DEFAULT_API_BASE_URL}/v1/npc/chat`,
    'http://localhost:8080/v1/npc/chat',
  ];

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000); // Hızlı backend kontrolü

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-Uid': uid,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.ok && data?.result) {
          clearTimeout(timer);
          return { result: data.result as NpcChatResult };
        }
      }
    } catch {
      // Backend dinlemiyor, sonraki adıma geç
    } finally {
      clearTimeout(timer);
    }
  }

  // 2. ADIM: Doğrudan OpenAI API Fallback (gpt-4o-mini)
  const directAiResult = await requestDirectOpenAiNpcChat(params);
  if (directAiResult) {
    return { result: directAiResult };
  }

  // 3. ADIM: Nihai Güvenlik Ağı (Offline Mock)
  return {
    result: buildInCharacterFallbackResult({
      relationship: params.relationship,
      reason: 'Çevrimdışı hazır yanıt',
    }),
  };
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
  const timer = setTimeout(
    () => controller.abort(),
    PERSONALZY_CLIENT_TIMEOUT_MS,
  );

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
