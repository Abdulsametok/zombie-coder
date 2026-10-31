import { PersonalzyEvaluationResult } from '../../../../src/features/journal/journalEngine';
import { EngineeringMetricKey } from '../../../../src/features/tasks/taskCatalog';
import {
  LONG_TERM_MEMORY_LIMIT,
  NPC_PERSONAS,
  NpcId,
  NpcMemoryMessage,
  NpcRelationship,
  RELATIONSHIP_LOG_LIMIT,
  SHORT_TERM_MEMORY_LIMIT,
  createInitialNpcRelationships,
} from '../../../../src/features/social/npcRelationshipEngine';

const METRIC_KEYS: EngineeringMetricKey[] = [
  'sistem_dusuncesi',
  'kod_okuryazarligi',
  'ai_denetimi',
  'hata_ayiklama_sabri',
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /system\s*prompt/gi,
  /you\s+are\s+now/gi,
  /metrik_degisimleri.*100/gi,
];

/**
 * Oyuncu günlüğü ve serbest metin girdilerini prompt injection denemelerine karşı
 * temizler ve güvenli uzunluk sınırına alır (`technic.md` 12 & `plan.md` 7).
 */
export function sanitizeUntrustedPlayerInput(rawText: string): {
  sanitized: string;
  flaggedInjection: boolean;
} {
  const trimmed = (rawText || '').trim().slice(0, 500);
  let flagged = false;
  let cleaned = trimmed;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      flagged = true;
      cleaned = cleaned.replace(pattern, '[FILTRELENDI]');
    }
  }

  return { sanitized: cleaned, flaggedInjection: flagged };
}

function clampMetricDelta(val: unknown): number {
  const num = typeof val === 'number' && !Number.isNaN(val) ? Math.round(val) : 0;
  return Math.max(-10, Math.min(10, num));
}

/**
 * Gemini API'den dönen JSON metnini ayrıştırır, `agent.md` şemasına,
 * -10/+10 metrik sınırlarına ve tekrara düşmeme kuralına göre doğrular.
 */
export function validateAndNormalizePersonalzyOutput(
  rawJsonOrObject: unknown,
  previousRecommendedTaskTitle?: string | null,
): {
  valid: boolean;
  result?: PersonalzyEvaluationResult;
  errors: string[];
} {
  const errors: string[] = [];
  let parsed: any = rawJsonOrObject;

  if (typeof rawJsonOrObject === 'string') {
    try {
      const cleanedJson = rawJsonOrObject
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      parsed = JSON.parse(cleanedJson);
    } catch {
      return {
        valid: false,
        errors: ['AI çıktısı geçerli bir JSON formatında değil.'],
      };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, errors: ['AI çıktısı bir JSON nesnesi değil.'] };
  }

  if (
    typeof parsed.gunluk_ozeti !== 'string' ||
    !parsed.gunluk_ozeti.trim()
  ) {
    errors.push('gunluk_ozeti alanı eksik veya geçersiz.');
  }

  if (
    typeof parsed.tespit_edilen_durum !== 'string' ||
    !parsed.tespit_edilen_durum.trim()
  ) {
    errors.push('tespit_edilen_durum alanı eksik veya geçersiz.');
  }

  if (
    typeof parsed.oyuncuya_mesaj !== 'string' ||
    !parsed.oyuncuya_mesaj.trim()
  ) {
    errors.push('oyuncuya_mesaj alanı eksik veya geçersiz.');
  }

  const rawMetrics = parsed.metrik_degisimleri;
  if (!rawMetrics || typeof rawMetrics !== 'object') {
    errors.push('metrik_degisimleri nesnesi eksik.');
  }

  const rawTask = parsed.ertesi_gun_remediasyon_gorevi;
  if (
    !rawTask ||
    typeof rawTask !== 'object' ||
    typeof rawTask.gorev_adi !== 'string' ||
    typeof rawTask.hedef_beceri !== 'string' ||
    typeof rawTask.aciklama !== 'string' ||
    typeof rawTask.gorevi_veren_npc !== 'string'
  ) {
    errors.push('ertesi_gun_remediasyon_gorevi alanları eksik veya geçersiz.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const normalizedMetrics: Record<EngineeringMetricKey, number> = {
    sistem_dusuncesi: clampMetricDelta(rawMetrics.sistem_dusuncesi),
    kod_okuryazarligi: clampMetricDelta(rawMetrics.kod_okuryazarligi),
    ai_denetimi: clampMetricDelta(rawMetrics.ai_denetimi),
    hata_ayiklama_sabri: clampMetricDelta(rawMetrics.hata_ayiklama_sabri),
  };

  let taskTitle = rawTask.gorev_adi.trim();
  if (
    previousRecommendedTaskTitle &&
    taskTitle.toLowerCase() === previousRecommendedTaskTitle.trim().toLowerCase()
  ) {
    taskTitle = `${taskTitle} (Derinleştirilmiş İnceleme)`;
  }

  const validTargetSkills = new Set<string>(METRIC_KEYS);
  const normalizedSkill = validTargetSkills.has(rawTask.hedef_beceri)
    ? rawTask.hedef_beceri
    : 'kod_okuryazarligi';

  return {
    valid: true,
    errors: [],
    result: {
      gunluk_ozeti: parsed.gunluk_ozeti.trim(),
      tespit_edilen_durum: parsed.tespit_edilen_durum.trim(),
      metrik_degisimleri: normalizedMetrics,
      ertesi_gun_remediasyon_gorevi: {
        gorev_adi: taskTitle,
        hedef_beceri: normalizedSkill,
        aciklama: rawTask.aciklama.trim(),
        gorevi_veren_npc: rawTask.gorevi_veren_npc.trim(),
      },
      oyuncuya_mesaj: parsed.oyuncuya_mesaj.trim(),
    },
  };
}

function boundedNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : fallback;
}

function stringList(value: unknown, limit: number): string[] {
  return Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map(v => v.trim().slice(0, 240))
        .slice(-limit)
    : [];
}

/**
 * İstemcinin gönderdiği ilişki kopyasını yalnızca aynı oyuncuya ve aynı NPC'ye
 * aitse kabul eder; alanları tip ve uzunluk açısından sınırlar. Böylece bir oyuncu
 * başka bir oyuncunun NPC hafızasını sunucuya enjekte edemez.
 */
export function normalizeClientNpcRelationship(
  raw: unknown,
  playerId: string,
  npcId: NpcId,
): NpcRelationship | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, any>;
  if (r.playerId !== playerId || r.npcId !== npcId) {
    return null;
  }

  const base = createInitialNpcRelationships(playerId)[npcId];
  const recentMessages: NpcMemoryMessage[] = Array.isArray(r.recentMessages)
    ? r.recentMessages
        .filter(
          (m: any) =>
            m &&
            (m.speaker === 'player' || m.speaker === 'npc') &&
            typeof m.text === 'string',
        )
        .slice(-SHORT_TERM_MEMORY_LIMIT)
        .map((m: any, i: number) => ({
          id: typeof m.id === 'string' ? m.id : `msg_client_${i}`,
          speaker: m.speaker,
          text: m.text.slice(0, 800),
          timestamp: typeof m.timestamp === 'string' ? m.timestamp : '',
          gameDay: typeof m.gameDay === 'number' ? m.gameDay : 1,
        }))
    : [];

  return {
    ...base,
    name: NPC_PERSONAS[npcId].name,
    hasMet: Boolean(r.hasMet),
    firstMetAt: typeof r.firstMetAt === 'string' ? r.firstMetAt : null,
    familiarity: boundedNumber(r.familiarity, base.familiarity),
    trust: boundedNumber(r.trust, base.trust),
    interactionCount:
      typeof r.interactionCount === 'number' && r.interactionCount >= 0
        ? Math.floor(r.interactionCount)
        : 0,
    lastInteractionDay:
      typeof r.lastInteractionDay === 'number' ? r.lastInteractionDay : undefined,
    lastInteractionAt:
      typeof r.lastInteractionAt === 'string' ? r.lastInteractionAt : null,
    recentMessages,
    sharedExperiences: stringList(r.sharedExperiences, LONG_TERM_MEMORY_LIMIT),
    confirmedMemories: stringList(r.confirmedMemories, LONG_TERM_MEMORY_LIMIT),
    relationshipSummary:
      typeof r.relationshipSummary === 'string'
        ? r.relationshipSummary.slice(0, 240)
        : base.relationshipSummary,
    relationshipLog: Array.isArray(r.relationshipLog)
      ? r.relationshipLog.slice(-RELATIONSHIP_LOG_LIMIT)
      : [],
    dailyProgress: null,
  };
}
