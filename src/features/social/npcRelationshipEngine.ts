/**
 * Zombie Coder — AI-Native NPC Conversation Engine (istemci ve backend ortak modeli)
 *
 * Mimari İlkeler:
 * 1. NPC cevapları her zaman backend üzerinden Gemini ile üretilir. Bu dosyada sabit
 *    cevap şablonu yoktur; anahtar kelimeye göre cevap seçilmez.
 * 2. Her NPC'nin sabit bir karakter kimliği (`NPC_PERSONAS`), konuşma tarzı, sınırları
 *    ve uzmanlık alanı vardır. Uzmanlık kişiliğin yalnızca bir parçasıdır.
 * 3. Her oyuncu-NPC ilişkisi (`NpcRelationship`) ayrı saklanır: kısa süreli hafıza
 *    (`recentMessages`), uzun süreli hafıza (`confirmedMemories`, `sharedExperiences`,
 *    `relationshipSummary`) ve gerekçeli ilişki değişim kaydı (`relationshipLog`).
 * 4. İlk tanışma (`hasMet === false`) yalnızca bir kez yaşanır.
 * 5. Diyalog cevabı ile oyun durumu etkileri ayrıdır. Yakınlık/güven değişimleri mesaj
 *    başına ve gün başına sınırlıdır; tek bir şaka veya küfür kalıcı etiket üretemez.
 * 6. Gemini hatalarında `buildControlledFallbackResult` sistem bildirimi döndürür; bu
 *    bildirim NPC cevabı gibi sunulmaz ve ilişki durumunu değiştirmez.
 */

import { LocationId } from '../../game/maps/worldMaps';
import { EngineeringMetricKey } from '../tasks/taskCatalog';

export type NpcId = 'coach_burak' | 'prof_demir' | 'asistan_elif' | 'kaan_mentor';

export const NPC_IDS: NpcId[] = [
  'coach_burak',
  'prof_demir',
  'asistan_elif',
  'kaan_mentor',
];

export type PlayerCommunicationStyle = 'casual' | 'balanced' | 'formal';

export type RelationshipTier = 'first_time' | 'acquaintance' | 'regular_trusted';

/**
 * Oyuncu mesajının Gemini tarafından yorumlanan niyeti. Yalnızca oyun durumu
 * etkilerini sınırlamak ve raporlamak için kullanılır; cevap metnini belirlemez.
 */
export type PlayerMessageIntent =
  | 'introduction'
  | 'greeting'
  | 'small_talk'
  | 'banter_or_joke'
  | 'provocation'
  | 'venting_or_low_mood'
  | 'opinion_question'
  | 'memory_recall'
  | 'project_talk'
  | 'expertise_request'
  | 'ambiguous';

export const PLAYER_MESSAGE_INTENTS: PlayerMessageIntent[] = [
  'introduction',
  'greeting',
  'small_talk',
  'banter_or_joke',
  'provocation',
  'venting_or_low_mood',
  'opinion_question',
  'memory_recall',
  'project_talk',
  'expertise_request',
  'ambiguous',
];

export const NPC_CHAT_TOKEN_COST = 30;
export const DAILY_NPC_CHAT_LIMIT = 6;

/** Kısa süreli hafızada saklanan mesaj sayısı (oyuncu + NPC). */
export const SHORT_TERM_MEMORY_LIMIT = 24;
/** Gemini'ye gönderilen son konuşma geçmişi uzunluğu. */
export const PROMPT_HISTORY_LIMIT = 12;
/** Uzun süreli hafıza kayıt sınırı. */
export const LONG_TERM_MEMORY_LIMIT = 12;
export const RELATIONSHIP_LOG_LIMIT = 10;

/** Tek mesajda izin verilen en büyük ilişki değişimi. */
export const RELATIONSHIP_DELTA_LIMITS = {
  familiarity: { min: -3, max: 4 },
  trust: { min: -3, max: 3 },
} as const;

/** Aynı oyun gününde bir NPC ile kazanılabilecek toplam yakınlık/güven üst sınırı. */
export const DAILY_RELATIONSHIP_GAIN_CAP = { familiarity: 10, trust: 6 } as const;

/** Şaka/kışkırtma gibi belirsiz mesajlarda değişim daha da daraltılır. */
const VOLATILE_INTENT_LIMITS = { min: -1, max: 1 } as const;
const VOLATILE_INTENTS: PlayerMessageIntent[] = [
  'banter_or_joke',
  'provocation',
  'ambiguous',
];

export const NPC_REPLY_MAX_CHARS = 700;
const MEMORY_MAX_CHARS = 160;

export interface NpcPersonaDefinition {
  npcId: NpcId;
  name: string;
  shortName: string;
  roleTitle: string;
  location: LocationId;
  background: string;
  personalityTraits: string[];
  expertise: string;
  speechStyle: string;
  boundaries: string;
  firstMeetingGreeting?: string;
}

export const NPC_PERSONAS: Record<NpcId, NpcPersonaDefinition> = {
  kaan_mentor: {
    npcId: 'kaan_mentor',
    name: 'Kaan',
    shortName: 'Kaan',
    roleTitle: 'Üniversite Öğrencisi / Planlama Konusunda Deneyimli Arkadaş',
    location: 'university',
    background:
      'Üst sınıfta bilgisayar mühendisliği öğrencisi. Kampüsteki çalışma masasında takılır, birkaç yan proje bitirmiş ve batırmış; bu yüzden planlamayı tecrübeyle bilir.',
    personalityTraits: [
      'Samimi',
      'Esprili',
      'Zaman zaman alaycı',
      'Yardımsever ama sürekli onaylayıcı değil',
      'Gerçekçi',
    ],
    expertise: 'Planlama, proje yönetimi ve önceliklendirme',
    speechStyle:
      'Genç, gündelik Türkçe. Kısa ve doğal konuşur. Gerektiğinde ciddi ve analitik olabilir. İltifat dağıtmaz, katılmadığında söyler.',
    boundaries:
      'Oyuncunun konuşma biçimine göre samimileşebilir ama her davranışı taklit etmez. Şiddeti veya saldırganlığı körüklemez; şakayla ya da net bir sınırla gerilimi düşürür. Her sohbeti proje yönetimine bağlamaz.',
  },
  prof_demir: {
    npcId: 'prof_demir',
    name: 'Prof. Demir',
    shortName: 'Prof. Demir',
    roleTitle: 'Algoritma, Veri Yapıları & Sistem Mimarisi Hocası',
    location: 'university',
    background:
      'Yıllardır algoritma ve sistem mimarisi dersleri veren, sektörde de çalışmış bir öğretim üyesi.',
    personalityTraits: [
      'Gözlemci',
      'Sakin',
      'Hafif kuru mizahlı',
      'Analitik',
      'Öğrenciyi darlamayan',
    ],
    expertise: 'Algoritmalar, veri yapıları ve ölçeklenebilir sistem mimarisi',
    speechStyle:
      'Akıcı, ölçülü Türkçe. Ders dışında öğrenciyle insan gibi sohbet eder, sürekli sınav yapıyor gibi konuşmaz.',
    boundaries:
      'Saygısızlığa sakin ama net sınır koyar. Öğrenci yorgunsa veya gündelik konuşuyorsa ders anlatmaz.',
  },
  coach_burak: {
    npcId: 'coach_burak',
    name: 'Koç Burak',
    shortName: 'Koç Burak',
    roleTitle: 'Spor Salonu Koçu & Satış Stratejisi Mentoru',
    location: 'gym',
    background:
      'Kampüs spor salonunun koçu. Gençken satış işinde çalışmış, şimdi öğrencilere hem antrenman hem ikna becerisi konusunda ağabeylik yapar.',
    personalityTraits: ['Enerjik', 'Dobra', 'Pratik', 'Moral verici ama gerçekçi'],
    expertise: 'Fiziksel kondisyon, satış psikolojisi, ikna ve değer konumlandırma',
    speechStyle:
      'Dinamik, ağabey/koç havasında doğal Türkçe. Lafı dolandırmaz, kısa ve net konuşur.',
    boundaries:
      'Kavga/agresyon imalarını sporcu disipliniyle yatıştırır. Oyuncunun morali bozuksa üstüne gitmez.',
    firstMeetingGreeting:
      'Merhaba, hoş geldin! Ben Koç Burak. Burada sana sağlıklı yaşam, motivasyon ve satış stratejileriyle alakalı bilgiler verebilirim. Adın ne?',
  },
  asistan_elif: {
    npcId: 'asistan_elif',
    name: 'Asistan Elif',
    shortName: 'Elif',
    roleTitle: 'Sistem Tasarımı & Lab Asistanı',
    location: 'university',
    background:
      'Yüksek lisans öğrencisi ve laboratuvar asistanı; öğrencilerin halinden anlar çünkü kendisi de yakın zamanda aynı yollardan geçti.',
    personalityTraits: ['Samimi', 'Pratik', 'Destekleyici', 'Net'],
    expertise: 'Laboratuvar uygulamaları, sistem akışları ve hata ayıklama',
    speechStyle: 'Rahat, öğrenci halinden anlayan yüksek lisans öğrencisi üslubu.',
    boundaries: 'Gereksiz resmiyet yapmaz ama sınırlarını korur.',
  },
};

export function isNpcId(value: unknown): value is NpcId {
  return typeof value === 'string' && (NPC_IDS as string[]).includes(value);
}

export interface NpcMemoryMessage {
  id: string;
  speaker: 'player' | 'npc';
  text: string;
  timestamp: string;
  gameDay: number;
  intent?: PlayerMessageIntent;
}

export interface NpcRelationshipChange {
  gameDay: number;
  timestamp: string;
  familiarityDelta: number;
  trustDelta: number;
  reason: string;
}

export interface NpcRelationship {
  playerId: string;
  npcId: NpcId;
  name: string;
  roleTitle: string;
  location: LocationId;
  hasMet: boolean;
  firstMetAt: string | null;
  familiarity: number; // 0..100
  trust: number; // 0..100
  interactionCount: number;
  lastInteractionDay?: number;
  lastInteractionAt: string | null;
  recentMessages: NpcMemoryMessage[];
  sharedExperiences: string[];
  confirmedMemories: string[];
  relationshipSummary: string;
  relationshipLog: NpcRelationshipChange[];
  dailyProgress: {
    gameDay: number;
    familiarityGained: number;
    trustGained: number;
  } | null;
}

export interface NpcChatTurn {
  id: string;
  speaker: 'player' | 'npc' | 'system';
  speakerName: string;
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

/** Harita üzerindeki konuşma balonu (oyuncu mesajı → NPC cevabı). */
export interface DialogueBubbleTurn {
  id: string;
  speakerKind: 'npc' | 'player';
  npcId: NpcId;
  speakerName: string;
  speakerRole: string;
  text: string;
  stepIndex: number;
  totalSteps: number;
}

export interface NpcQuickPromptOption {
  id: string;
  label: string;
  messageText: string;
}

/** Gemini çıktısının doğrulanmış ve sınırlandırılmış hali. */
export interface NpcModelTurn {
  npcReply: string;
  intent: PlayerMessageIntent;
  familiarityDelta: number;
  trustDelta: number;
  relationshipReason: string;
  memoryToConfirm: string | null;
  sharedExperienceToAdd: string | null;
  relationshipSummaryUpdate: string | null;
}

/** Diyalogdan bağımsız, oyun dünyasına uygulanan sınırlı etkiler. */
export interface NpcGameplayEffects {
  motivationDelta: number;
  socialDelta: number;
  metricDeltas: Partial<Record<EngineeringMetricKey, number>>;
}

export interface NpcChatResult {
  status: 'ok' | 'fallback';
  npcReply: string;
  detectedIntent: PlayerMessageIntent;
  updatedRelationship: NpcRelationship;
  relationshipChange: {
    familiarityDelta: number;
    trustDelta: number;
    reason: string;
  };
  gameplayEffects: NpcGameplayEffects;
  isFallback: boolean;
  fallbackReason?: string;
  source: 'gemini_live' | 'openai_fallback' | 'offline_mock' | 'controlled_fallback';
  model?: string;
  repetitionRetried?: boolean;
}

function createInitialRelationship(
  playerId: string,
  npcId: NpcId,
  familiarity: number,
  trust: number,
): NpcRelationship {
  const persona = NPC_PERSONAS[npcId];
  return {
    playerId,
    npcId,
    name: persona.name,
    roleTitle: persona.roleTitle,
    location: persona.location,
    hasMet: false,
    firstMetAt: null,
    familiarity,
    trust,
    interactionCount: 0,
    lastInteractionAt: null,
    recentMessages: [],
    sharedExperiences: [],
    confirmedMemories: [],
    relationshipSummary: 'Henüz tanışılmadı.',
    relationshipLog: [],
    dailyProgress: null,
  };
}

export function createInitialNpcRelationships(
  playerId = 'default_player',
): Record<NpcId, NpcRelationship> {
  return {
    coach_burak: createInitialRelationship(playerId, 'coach_burak', 10, 15),
    prof_demir: createInitialRelationship(playerId, 'prof_demir', 12, 18),
    asistan_elif: createInitialRelationship(playerId, 'asistan_elif', 15, 20),
    kaan_mentor: createInitialRelationship(playerId, 'kaan_mentor', 12, 18),
  };
}

export function getRelationshipTier(familiarity: number): RelationshipTier {
  if (familiarity < 20) {
    return 'first_time';
  }
  if (familiarity < 60) {
    return 'acquaintance';
  }
  return 'regular_trusted';
}

export function describeRelationshipTier(tier: RelationshipTier): string {
  switch (tier) {
    case 'first_time':
      return 'Yeni tanışıyorlar; henüz mesafeli ama sıcak.';
    case 'acquaintance':
      return 'Birbirlerini tanıyorlar; rahat, arkadaşça.';
    case 'regular_trusted':
      return 'Yakın arkadaşlar; içten, şakalaşabilen, güvene dayalı.';
  }
}

/** İlk tanışma ekranının gösterilip gösterilmeyeceği. */
export function needsFirstMeeting(relationship: NpcRelationship): boolean {
  return !relationship.hasMet;
}

/**
 * İlk tanışma ekranındaki iki hazır mesaj. Bu mesajlar yalnızca metin alanını
 * doldurur; gönderim oyuncunun açık seçimiyle yapılır.
 */
export function getFirstMeetingPrompts(
  playerName: string,
  npcId?: NpcId,
): NpcQuickPromptOption[] {
  if (npcId === 'coach_burak') {
    return [
      {
        id: 'first_intro_coach_a',
        label: `Merhaba Koç, ben ${playerName}. Hem formda kalmak hem de satış dinamiklerini öğrenmek istiyorum.`,
        messageText: `Merhaba Koç, ben ${playerName}. Hem formda kalmak hem de satış dinamiklerini öğrenmek istiyorum.`,
      },
      {
        id: 'first_intro_coach_b',
        label: `Selam! Yazılımcı kafasıyla spora ve satış taktiklerine sıfırdan başlıyorum.`,
        messageText: `Selam! Yazılımcı kafasıyla spora ve satış taktiklerine sıfırdan başlıyorum.`,
      },
    ];
  }

  if (npcId === 'prof_demir') {
    return [
      {
        id: 'first_intro_prof_a',
        label: `Merhaba hocam, ben ${playerName}. Dersi dinlemek ve kendimi geliştirmek için buradayım.`,
        messageText: `Merhaba hocam, ben ${playerName}. Dersi dinlemek ve kendimi geliştirmek için buradayım.`,
      },
      {
        id: 'first_intro_prof_b',
        label: `Saygılar hocam, okulun ilk günündeyim. Yazılım mühendisliği dersinizi heyecanla bekliyordum.`,
        messageText: `Saygılar hocam, okulun ilk günündeyim. Yazılım mühendisliği dersinizi heyecanla bekliyordum.`,
      },
    ];
  }

  return [
    {
      id: 'first_intro_formal',
      label: `Merhaba, ben ${playerName}. Okuldaki ilk günüm.`,
      messageText: `Merhaba, ben ${playerName}. Okuldaki ilk günüm.`,
    },
    {
      id: 'first_intro_casual',
      label: `Selam dostum, naber? Ben ${playerName}.`,
      messageText: `Selam dostum, naber? Ben ${playerName}.`,
    },
  ];
}

// ============================================================================
// Tekrar ve kalıp ifade denetimi
// ============================================================================

/** NPC'lerin sürekli kullanmaması gereken yağcı kalıp ifadeler. */
export const BANNED_SYCOPHANTIC_PHRASES = [
  'süper bir nokta yakaladın',
  'harika bir nokta yakaladın',
  'harika bir bakış açısı',
  'harika bir soru',
  'çok güzel bir soru',
  'çok güzel bir noktaya değindin',
  'muhteşem bir fikir',
];

export function normalizeForComparison(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9çğıöşüâîû\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kelime kümeleri üzerinden Jaccard benzerliği (0..1). */
export function replySimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeForComparison(a).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeForComparison(b).split(' ').filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }
  let intersection = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) {
      intersection += 1;
    }
  });
  return intersection / (wordsA.size + wordsB.size - intersection);
}

export const REPETITION_SIMILARITY_THRESHOLD = 0.7;

/**
 * Yeni NPC cevabı önceki cevaplardan birinin tekrarıysa veya yasaklı kalıp ifade
 * içeriyorsa sebebini döndürür; sorun yoksa `null`.
 */
export function findReplyQualityIssue(
  reply: string,
  recentMessages: NpcMemoryMessage[],
): string | null {
  const normalized = normalizeForComparison(reply);
  const banned = BANNED_SYCOPHANTIC_PHRASES.find(p => normalized.includes(p));
  if (banned) {
    return `Yasaklı kalıp ifade kullanıldı: "${banned}"`;
  }

  const previousNpcReplies = recentMessages
    .filter(m => m.speaker === 'npc')
    .slice(-6);
  for (const prev of previousNpcReplies) {
    if (replySimilarity(reply, prev.text) >= REPETITION_SIMILARITY_THRESHOLD) {
      return `Önceki cevaba çok benziyor: "${prev.text}"`;
    }
  }
  return null;
}

// ============================================================================
// Gemini çıktısı doğrulama
// ============================================================================

function clampNumber(value: unknown, min: number, max: number): number {
  const num =
    typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;
  return Math.max(min, Math.min(max, num));
}

function cleanOptionalText(value: unknown, maxChars: number): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') {
    return null;
  }
  return trimmed.slice(0, maxChars);
}

const PERSONALITY_LABEL_PATTERN =
  /(^|[^a-zçğıöşü])(kavgacı|saldırgan|agresif|tembel|kaba|terbiyesiz|sorunlu|başarısız|beceriksiz|tehlikeli|şiddete meyilli)(?=$|[^a-zçğıöşü])/;

/**
 * Hafızaya yazılacak metin oyuncuya kalıcı kişilik etiketi yapıştırıyorsa reddeder.
 * Hafıza, yaşanan olayları kaydeder; oyuncuyu tek bir anla tanımlamaz.
 */
export function isPersonalityLabel(memory: string): boolean {
  return PERSONALITY_LABEL_PATTERN.test(memory.toLocaleLowerCase('tr-TR'));
}

export function normalizeNpcModelOutput(rawJsonOrObject: unknown): {
  valid: boolean;
  turn?: NpcModelTurn;
  errors: string[];
} {
  let parsed: any = rawJsonOrObject;
  if (typeof rawJsonOrObject === 'string') {
    try {
      parsed = JSON.parse(
        rawJsonOrObject
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/```$/i, '')
          .trim(),
      );
    } catch {
      return { valid: false, errors: ['Model çıktısı geçerli JSON değil.'] };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, errors: ['Model çıktısı bir JSON nesnesi değil.'] };
  }

  const npcReply =
    typeof parsed.npcReply === 'string' ? parsed.npcReply.trim() : '';
  if (!npcReply) {
    return { valid: false, errors: ['npcReply alanı boş veya eksik.'] };
  }

  const intent: PlayerMessageIntent = (
    PLAYER_MESSAGE_INTENTS as string[]
  ).includes(parsed.intent)
    ? parsed.intent
    : 'ambiguous';

  const volatile = VOLATILE_INTENTS.includes(intent);
  const famLimits = volatile
    ? VOLATILE_INTENT_LIMITS
    : RELATIONSHIP_DELTA_LIMITS.familiarity;
  const trustLimits = volatile
    ? VOLATILE_INTENT_LIMITS
    : RELATIONSHIP_DELTA_LIMITS.trust;

  let memoryToConfirm = cleanOptionalText(
    parsed.memoryToConfirm,
    MEMORY_MAX_CHARS,
  );
  if (memoryToConfirm && isPersonalityLabel(memoryToConfirm)) {
    memoryToConfirm = null;
  }
  let sharedExperienceToAdd = cleanOptionalText(
    parsed.sharedExperienceToAdd,
    MEMORY_MAX_CHARS,
  );
  if (sharedExperienceToAdd && isPersonalityLabel(sharedExperienceToAdd)) {
    sharedExperienceToAdd = null;
  }
  let relationshipSummaryUpdate = cleanOptionalText(
    parsed.relationshipSummaryUpdate,
    240,
  );
  if (relationshipSummaryUpdate && isPersonalityLabel(relationshipSummaryUpdate)) {
    relationshipSummaryUpdate = null;
  }

  return {
    valid: true,
    errors: [],
    turn: {
      npcReply: npcReply.slice(0, NPC_REPLY_MAX_CHARS),
      intent,
      familiarityDelta: clampNumber(
        parsed.familiarityDelta,
        famLimits.min,
        famLimits.max,
      ),
      trustDelta: clampNumber(parsed.trustDelta, trustLimits.min, trustLimits.max),
      relationshipReason:
        cleanOptionalText(parsed.relationshipReason, 200) ||
        'Gerekçe belirtilmedi.',
      memoryToConfirm,
      sharedExperienceToAdd,
      relationshipSummaryUpdate,
    },
  };
}

// ============================================================================
// İlişki ve oyun durumu güncellemeleri
// ============================================================================

function pushUnique(list: string[], item: string | null, limit: number): string[] {
  if (!item) {
    return list.slice(-limit);
  }
  const exists = list.some(
    existing => normalizeForComparison(existing) === normalizeForComparison(item),
  );
  return (exists ? list : [...list, item]).slice(-limit);
}

/**
 * Doğrulanmış model çıktısını ilişkiye uygular. Değişimler mesaj başına
 * (`normalizeNpcModelOutput`) ve gün başına (`DAILY_RELATIONSHIP_GAIN_CAP`) sınırlıdır;
 * her değişim gerekçesiyle `relationshipLog`'a yazılır.
 */
export function applyNpcTurnToRelationship(params: {
  relationship: NpcRelationship;
  playerMessage: string;
  turn: NpcModelTurn;
  gameDay: number;
  timestampIso?: string;
}): {
  relationship: NpcRelationship;
  appliedFamiliarityDelta: number;
  appliedTrustDelta: number;
} {
  const {
    relationship,
    playerMessage,
    turn,
    gameDay,
    timestampIso = new Date().toISOString(),
  } = params;

  const progress =
    relationship.dailyProgress && relationship.dailyProgress.gameDay === gameDay
      ? relationship.dailyProgress
      : { gameDay, familiarityGained: 0, trustGained: 0 };

  const famRoom = Math.max(
    0,
    DAILY_RELATIONSHIP_GAIN_CAP.familiarity - progress.familiarityGained,
  );
  const trustRoom = Math.max(
    0,
    DAILY_RELATIONSHIP_GAIN_CAP.trust - progress.trustGained,
  );
  const famDelta =
    turn.familiarityDelta > 0
      ? Math.min(turn.familiarityDelta, famRoom)
      : turn.familiarityDelta;
  const trustDelta =
    turn.trustDelta > 0 ? Math.min(turn.trustDelta, trustRoom) : turn.trustDelta;

  const nextFamiliarity = Math.max(
    0,
    Math.min(100, relationship.familiarity + famDelta),
  );
  const nextTrust = Math.max(0, Math.min(100, relationship.trust + trustDelta));

  const turnIndex = relationship.interactionCount + 1;
  const playerMemMsg: NpcMemoryMessage = {
    id: `msg_${relationship.npcId}_${turnIndex}_p`,
    speaker: 'player',
    text: playerMessage.trim(),
    timestamp: timestampIso,
    gameDay,
    intent: turn.intent,
  };
  const npcMemMsg: NpcMemoryMessage = {
    id: `msg_${relationship.npcId}_${turnIndex}_n`,
    speaker: 'npc',
    text: turn.npcReply,
    timestamp: timestampIso,
    gameDay,
  };

  const log =
    famDelta !== 0 || trustDelta !== 0
      ? [
          ...(relationship.relationshipLog || []),
          {
            gameDay,
            timestamp: timestampIso,
            familiarityDelta: famDelta,
            trustDelta,
            reason: turn.relationshipReason,
          },
        ].slice(-RELATIONSHIP_LOG_LIMIT)
      : relationship.relationshipLog || [];

  return {
    appliedFamiliarityDelta: famDelta,
    appliedTrustDelta: trustDelta,
    relationship: {
      ...relationship,
      hasMet: true,
      firstMetAt: relationship.firstMetAt || timestampIso,
      familiarity: nextFamiliarity,
      trust: nextTrust,
      interactionCount: turnIndex,
      lastInteractionDay: gameDay,
      lastInteractionAt: timestampIso,
      recentMessages: [
        ...(relationship.recentMessages || []),
        playerMemMsg,
        npcMemMsg,
      ].slice(-SHORT_TERM_MEMORY_LIMIT),
      confirmedMemories: pushUnique(
        relationship.confirmedMemories || [],
        turn.memoryToConfirm,
        LONG_TERM_MEMORY_LIMIT,
      ),
      sharedExperiences: pushUnique(
        relationship.sharedExperiences || [],
        turn.sharedExperienceToAdd,
        LONG_TERM_MEMORY_LIMIT,
      ),
      relationshipSummary:
        turn.relationshipSummaryUpdate || relationship.relationshipSummary,
      relationshipLog: log,
      dailyProgress: {
        gameDay,
        familiarityGained: progress.familiarityGained + Math.max(0, famDelta),
        trustGained: progress.trustGained + Math.max(0, trustDelta),
      },
    },
  };
}

const EXPERTISE_METRICS: Record<
  NpcId,
  Partial<Record<EngineeringMetricKey, number>>
> = {
  kaan_mentor: { sistem_dusuncesi: 1 },
  prof_demir: { sistem_dusuncesi: 1, kod_okuryazarligi: 1 },
  coach_burak: { hata_ayiklama_sabri: 1 },
  asistan_elif: { hata_ayiklama_sabri: 1 },
};

/**
 * Sohbetin oyun dünyasına etkisi deterministik ve küçük tutulur; NPC'nin oyuncu
 * hakkındaki yorumu oyun deneyimini kontrolsüz biçimde değiştiremez.
 */
export function computeGameplayEffects(params: {
  npcId: NpcId;
  intent: PlayerMessageIntent;
  appliedFamiliarityDelta: number;
}): NpcGameplayEffects {
  const { npcId, intent, appliedFamiliarityDelta } = params;
  const socialDelta = 1 + Math.max(0, Math.min(2, appliedFamiliarityDelta));
  const motivationDelta = intent === 'venting_or_low_mood' ? 3 : 1;
  const metricDeltas =
    intent === 'expertise_request' || intent === 'project_talk'
      ? EXPERTISE_METRICS[npcId]
      : {};
  return { motivationDelta, socialDelta, metricDeltas };
}

/**
 * Çevrimdışı / API kesintisi anında ilgili NPC'nin kişiliğine uygun hazır yerel yanıt.
 * Sistem hatası basmak yerine NPC kendi karakterine uygun şekilde yoğun olduğunu söyler.
 */
export function getInCharacterOfflineFallbackReply(npcId: NpcId): string {
  switch (npcId) {
    case 'coach_burak':
      return 'Şu an salonda set aralarındayım, hemen toparlayıp geliyorum; birazdan tekrar konuşalım şampiyon!';
    case 'prof_demir':
      return 'Şu an amfide tahtadaki notları toparlıyorum; birazdan veya bir sonraki derste bu konuyu detaylandıralım.';
    case 'kaan_mentor':
      return 'Kafamı projeden yeni kaldırdım, biraz kod toparlıyorum; birkaç dakikaya tekrar konuşalım dostum!';
    case 'asistan_elif':
      return 'Laboratuvardaki test cihazlarını kalibre ediyordum; hemen toparlayıp döneceğim, birazdan konuşalım.';
    default:
      return 'Şu an biraz yoğunum; birkaç dakika sonra tekrar konuşalım!';
  }
}

/**
 * Hem Gemini hem OpenAI yanıt vermediğinde veya çevrimdışı kalındığında
 * ekranda kırmızı sistem hatası basmadan NPC kişiliğine uygun akıcı yanıt üretir.
 */
export function buildInCharacterFallbackResult(params: {
  relationship: NpcRelationship;
  reason?: string;
}): NpcChatResult {
  const { relationship, reason = 'Karakter yoğunluk durumu' } = params;
  const reply = getInCharacterOfflineFallbackReply(relationship.npcId);

  return {
    status: 'ok',
    npcReply: reply,
    detectedIntent: 'small_talk',
    updatedRelationship: {
      ...relationship,
      hasMet: true,
      interactionCount: relationship.interactionCount + 1,
      lastInteractionAt: new Date().toISOString(),
      recentMessages: [
        ...relationship.recentMessages.slice(-22),
        {
          id: `inchar_m_${Date.now()}`,
          speaker: 'npc',
          text: reply,
          timestamp: new Date().toISOString(),
          gameDay: 1,
        },
      ],
    },
    relationshipChange: {
      familiarityDelta: 1,
      trustDelta: 0,
      reason: 'Karakter yoğunluk durumunu paylaştı.',
    },
    gameplayEffects: {
      motivationDelta: 2,
      socialDelta: 2,
      metricDeltas: {},
    },
    isFallback: false,
    fallbackReason: reason,
    source: 'offline_mock',
  };
}

/**
 * Gemini'ye ulaşılamadığında döndürülen kontrollü sonuç. Metin NPC ağzından
 * yazılmaz, ilişki ve hafıza değişmez; istemci bunu sistem bildirimi olarak gösterir.
 */
export function buildControlledFallbackResult(params: {
  relationship: NpcRelationship;
  reason: string;
}): NpcChatResult {
  const { relationship, reason } = params;
  return {
    status: 'fallback',
    npcReply: `${relationship.name} şu an cevap veremiyor (bağlantı sorunu). Mesajın işlenmedi, birazdan tekrar deneyebilirsin.`,
    detectedIntent: 'ambiguous',
    updatedRelationship: relationship,
    relationshipChange: { familiarityDelta: 0, trustDelta: 0, reason },
    gameplayEffects: { motivationDelta: 0, socialDelta: 0, metricDeltas: {} },
    isFallback: true,
    fallbackReason: reason,
    source: 'controlled_fallback',
  };
}

/** Oyun günleri arasındaki farkı insan diliyle ifade eder ("bugün", "dün", "3 gün önce"). */
export function describeGameDayDistance(
  messageDay: number,
  currentDay: number,
): string {
  const diff = currentDay - messageDay;
  if (diff <= 0) {
    return 'bugün';
  }
  if (diff === 1) {
    return 'dün';
  }
  return `${diff} gün önce`;
}
