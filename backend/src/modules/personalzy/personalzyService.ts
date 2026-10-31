import { GoogleGenAI } from '@google/genai';
import { loadBackendEnv } from '../../config/env';
import {
  PERSONALZY_SYSTEM_INSTRUCTION,
  buildPersonalzyReflectionPrompt,
} from '../../prompts/personalzyPrompts';
import {
  sanitizeUntrustedPlayerInput,
  validateAndNormalizePersonalzyOutput,
} from '../validation/schemaValidator';
import { checkAndRecordQuota } from '../quota/playerQuota';
import {
  PersonalzyEvaluationResult,
  evaluateJournalWithPersonalzy,
} from '../../../../src/features/journal/journalEngine';

export interface PersonalzyReflectRequest {
  playerId: string;
  gameDay: number;
  grade: number;
  completedTaskIdsToday: string[];
  triggeredTrapToday: boolean;
  visitedGymToday: boolean;
  selectedQuickAnswerId: string | null;
  freeTextNote: string;
  skippedDetails: boolean;
  verifiedPreferences: string[];
  previousRecommendedTaskTitle?: string | null;
}

export interface PersonalzyReflectResponse {
  evaluation: PersonalzyEvaluationResult;
  source: 'gemini_live' | 'validated_fallback';
  flaggedInjection: boolean;
  validationErrors?: string[];
}

/**
 * `agent.md` içerisindeki GoogleGenAI (`ai.interactions.create`) yapısını kullanarak
 * oyuncunun gün sonu günlüğünü analiz eder. Hata, kota aşımı veya şema uyumsuzluğunda
 * oyunu kilitlemeden doğrulanmış deterministik fallback yanıtına döner (`plan.md` 4.3).
 */
export async function reflectWithPersonalzy(
  req: PersonalzyReflectRequest,
): Promise<PersonalzyReflectResponse> {
  const { sanitized, flaggedInjection } = sanitizeUntrustedPlayerInput(
    req.freeTextNote,
  );

  const fallbackEvaluation = evaluateJournalWithPersonalzy({
    gameDay: req.gameDay,
    completedTaskIdsToday: req.completedTaskIdsToday,
    triggeredTrapToday: req.triggeredTrapToday,
    selectedQuickAnswerId: req.selectedQuickAnswerId,
    freeTextNote: sanitized,
    skippedDetails: req.skippedDetails,
    visitedGymToday: req.visitedGymToday,
  });

  // 1. Oyuncu "Bugün paylaşmak istemiyorum" seçtiyse gereksiz Gemini çağrısı yapma (plan.md 4.3)
  if (req.skippedDetails) {
    return {
      evaluation: fallbackEvaluation,
      source: 'validated_fallback',
      flaggedInjection,
    };
  }

  // 2. Kota ve rate-limit kontrolü
  const quota = checkAndRecordQuota(req.playerId);
  if (!quota.allowed) {
    return {
      evaluation: fallbackEvaluation,
      source: 'validated_fallback',
      flaggedInjection,
      validationErrors: [quota.reason || 'Rate limit exceeded'],
    };
  }

  const env = loadBackendEnv();
  if (!env.geminiApiKey) {
    return {
      evaluation: fallbackEvaluation,
      source: 'validated_fallback',
      flaggedInjection,
      validationErrors: ['GEMINI_API_KEY tanımlı değil; yerel şablon kullanıldı.'],
    };
  }

  const inputPrompt = buildPersonalzyReflectionPrompt({
    playerId: req.playerId,
    gameDay: req.gameDay,
    grade: req.grade,
    completedTaskIdsToday: req.completedTaskIdsToday,
    triggeredTrapToday: req.triggeredTrapToday,
    visitedGymToday: req.visitedGymToday,
    selectedQuickAnswerId: req.selectedQuickAnswerId,
    sanitizedFreeTextNote: sanitized,
    skippedDetails: req.skippedDetails,
    verifiedPreferences: req.verifiedPreferences,
    previousRecommendedTaskTitle: req.previousRecommendedTaskTitle,
  });

  try {
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

    // `agent.md` içerisindeki ai.interactions.create çağrısı:
    const interaction = await (ai as any).interactions.create({
      model: env.geminiModel,
      input: inputPrompt,
      system_instruction: PERSONALZY_SYSTEM_INSTRUCTION,
      generation_config: {
        max_output_tokens: 2048,
        thinking_level: 'low',
      },
      response_mime_type: 'application/json',
    });

    const rawText: string | undefined = interaction?.output_text;
    if (!rawText) {
      return {
        evaluation: fallbackEvaluation,
        source: 'validated_fallback',
        flaggedInjection,
        validationErrors: ['Gemini boş yanıt döndürdü.'],
      };
    }

    const validation = validateAndNormalizePersonalzyOutput(
      rawText,
      req.previousRecommendedTaskTitle,
    );

    if (!validation.valid || !validation.result) {
      return {
        evaluation: fallbackEvaluation,
        source: 'validated_fallback',
        flaggedInjection,
        validationErrors: validation.errors,
      };
    }

    return {
      evaluation: validation.result,
      source: 'gemini_live',
      flaggedInjection,
    };
  } catch (err: any) {
    return {
      evaluation: fallbackEvaluation,
      source: 'validated_fallback',
      flaggedInjection,
      validationErrors: [err?.message || 'Gemini API çağrısı başarısız oldu.'],
    };
  }
}
