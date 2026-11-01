import { GoogleGenAI } from '@google/genai';
import { BackendEnvConfig, loadBackendEnv } from '../../config/env';
import {
  NPC_CHAT_RESPONSE_SCHEMA,
  buildNpcConversationPrompt,
  buildNpcSystemInstruction,
} from '../../prompts/personalzyPrompts';
import {
  normalizeClientNpcRelationship,
  sanitizeUntrustedPlayerInput,
} from '../validation/schemaValidator';
import { checkAndRecordQuota } from '../quota/playerQuota';
import {
  IsolatedFirestoreWorldStore,
  defaultWorldStore,
} from '../world/firestoreWorldStore';
import {
  NpcChatResult,
  NpcId,
  NpcModelTurn,
  NpcRelationship,
  PlayerCommunicationStyle,
  applyNpcTurnToRelationship,
  buildControlledFallbackResult,
  computeGameplayEffects,
  findReplyQualityIssue,
  normalizeNpcModelOutput,
} from '../../../../src/features/social/npcRelationshipEngine';

export interface NpcModelRequest {
  model: string;
  systemInstruction: string;
  input: string;
  timeoutMs: number;
}

/** Gemini'ye tek bir NPC çağrısı yapar ve ham JSON metnini döndürür. */
export type NpcModelClient = (req: NpcModelRequest) => Promise<string | undefined>;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Gemini ${ms} ms içinde yanıt vermedi.`)),
      ms,
    );
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * SDK 429/5xx hatalarını varsayılan olarak dakikalarca sessizce yeniden dener; sohbet
 * için bu bir "donma" gibi görünür. Yeniden deneme kapatılır, kota hatası hemen
 * raporlanır ve gecikme yedek model (hedge) ile karşılanır.
 */
export function createGeminiNpcModelClient(apiKey: string): NpcModelClient {
  const ai = new GoogleGenAI({ apiKey });
  return async req => {
    const interaction = await withTimeout(
      ai.interactions.create(
        {
          model: req.model,
          input: req.input,
          system_instruction: req.systemInstruction,
          generation_config: {
            max_output_tokens: 800,
            thinking_level: 'low',
          },
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: NPC_CHAT_RESPONSE_SCHEMA,
          },
        },
        { timeout_ms: req.timeoutMs, retries: { strategy: 'none' } },
      ),
      req.timeoutMs,
    );
    return interaction?.output_text;
  };
}

/**
 * Gemini zaman aşımına uğradığında veya 5xx hatası verdiğinde
 * kullanıcıya hata basmadan anında devreye giren OpenAI model istemcisi.
 * En düşük maliyetli ve hızlı model olan gpt-4o-mini (max_tokens: 150) kullanılır.
 */
export function createOpenAiNpcModelClient(
  apiKey: string,
  defaultModel = 'gpt-4o-mini',
): NpcModelClient {
  return async req => {
    const timeoutMs = req.timeoutMs > 0 ? req.timeoutMs : 25000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const promptPayload = {
        model: req.model || defaultModel,
        messages: [
          {
            role: 'system',
            content: `${req.systemInstruction}\n\nIMPORTANT: Respond with valid JSON matching this exact structure:
{
  "npcReply": "Cevabınız (Doğal Türkçe, en fazla 2-3 cümle)",
  "intent": "greeting | small_talk | banter_or_joke | provocation | venting_or_low_mood | opinion_question | memory_recall | project_talk | expertise_request | ambiguous",
  "familiarityDelta": 1,
  "trustDelta": 0,
  "relationshipReason": "Kısa Türkçe açıklama",
  "memoryToConfirm": null,
  "sharedExperienceToAdd": null,
  "relationshipSummaryUpdate": null
}`,
          },
          {
            role: 'user',
            content: req.input,
          },
        ],
        max_tokens: 150,
        response_format: { type: 'json_object' },
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(promptPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`OpenAI HTTP ${response.status}: ${errorText.slice(0, 100)}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return content;
    } finally {
      clearTimeout(timer);
    }
  };
}

function describeModelError(err: any): string {
  const message = String(err?.message || 'hata');
  if (err?.status === 429 || message.includes('429')) {
    return 'kota sınırı (429)';
  }
  if (/timed out|timeout|zaman|yanıt vermedi/i.test(message)) {
    return 'zaman aşımı';
  }
  return message.slice(0, 120);
}

/**
 * Birincil modeli hemen, yedek modeli `hedgeAfterMs` sonra (veya birincil erken hata
 * verirse hemen) çağırır; ilk dolu Gemini yanıtını kullanır. Her iki yanıt da gerçek
 * model çıktısıdır; sabit şablona düşülmez.
 */
function generateWithHedge(
  modelClient: NpcModelClient,
  request: Omit<NpcModelRequest, 'model' | 'timeoutMs'>,
  models: string[],
  hedgeAfterMs: number,
  timeoutMs: number,
): Promise<{ raw: string; model: string }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const errors: string[] = [];
    let settled = false;
    let started = 0;
    let finished = 0;
    let hedgeTimer: ReturnType<typeof setTimeout> | null = null;
    const deadline = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (hedgeTimer) {
          clearTimeout(hedgeTimer);
        }
        reject(new Error(`Gemini ${timeoutMs} ms içinde yanıt vermedi.`));
      }
    }, timeoutMs);

    const startNext = () => {
      if (settled || started >= models.length) {
        return;
      }
      const model = models[started];
      started += 1;
      const remaining = timeoutMs - (Date.now() - startedAt);
      modelClient({ ...request, model, timeoutMs: remaining }).then(
        raw => {
          finished += 1;
          if (settled) {
            return;
          }
          if (raw && raw.trim()) {
            settled = true;
            clearTimeout(deadline);
            if (hedgeTimer) {
              clearTimeout(hedgeTimer);
            }
            resolve({ raw, model });
            return;
          }
          onFailure(`${model}: boş yanıt`);
        },
        err => {
          finished += 1;
          if (!settled) {
            onFailure(`${model}: ${describeModelError(err)}`);
          }
        },
      );
    };

    const onFailure = (message: string) => {
      errors.push(message);
      if (started < models.length) {
        if (hedgeTimer) {
          clearTimeout(hedgeTimer);
          hedgeTimer = null;
        }
        startNext();
      } else if (finished >= started) {
        settled = true;
        clearTimeout(deadline);
        reject(new Error(errors.join(' | ')));
      }
    };

    startNext();
    if (models.length > 1) {
      hedgeTimer = setTimeout(() => {
        hedgeTimer = null;
        startNext();
      }, hedgeAfterMs);
    }
  });
}

export interface NpcChatServiceRequest {
  playerId: string;
  npcId: NpcId;
  playerMessage: string;
  playerName: string;
  playerStyle: PlayerCommunicationStyle;
  gameDay: number;
  clock?: string | null;
  playerLocationLabel?: string | null;
  activeTaskTitle?: string | null;
  /** İstemcideki ilişki kopyası; sunucuda kayıt yoksa başlangıç verisi olarak kullanılır. */
  clientRelationship?: unknown;
}

export interface NpcChatServiceDeps {
  store?: IsolatedFirestoreWorldStore;
  /** `null`: model istemcisi yok (API anahtarı tanımsız). */
  modelClient?: NpcModelClient | null;
  openAiClient?: NpcModelClient | null;
  env?: BackendEnvConfig;
  logger?: (line: string) => void;
}

const MIN_ATTEMPT_BUDGET_MS = 2000;

/**
 * Sunucudaki kaydı esas alır. Sunucu bu ilişkiyi hiç görmediyse (ör. backend yeniden
 * başlatıldı) ve istemci aynı oyuncuya ait geçerli bir kopya gönderdiyse onu benimser.
 */
function resolveRelationship(
  store: IsolatedFirestoreWorldStore,
  req: NpcChatServiceRequest,
): NpcRelationship {
  const serverCopy = store.getNpcRelationship(req.playerId, req.playerId, req.npcId);
  if (serverCopy.interactionCount > 0 || serverCopy.hasMet) {
    return serverCopy;
  }
  const clientCopy = normalizeClientNpcRelationship(
    req.clientRelationship,
    req.playerId,
    req.npcId,
  );
  return clientCopy && clientCopy.interactionCount > 0 ? clientCopy : serverCopy;
}

/**
 * AI-Native NPC sohbeti: her mesajda Gemini çağrılır. Cevap tekrar ediyorsa veya
 * yağcı kalıp içeriyorsa bir kez yeniden üretilir. Gemini'ye ulaşılamazsa ilişkiyi
 * değiştirmeyen, açıkça işaretlenmiş kontrollü fallback döner.
 */
export async function chatWithNpc(
  req: NpcChatServiceRequest,
  deps: NpcChatServiceDeps = {},
): Promise<NpcChatResult> {
  const store = deps.store || defaultWorldStore;
  const env = deps.env || loadBackendEnv();
  const log = deps.logger || ((line: string) => console.info(line));
  const relationship = resolveRelationship(store, req);

  const { sanitized } = sanitizeUntrustedPlayerInput(req.playerMessage);
  if (!sanitized) {
    return buildControlledFallbackResult({
      relationship,
      reason: 'Boş mesaj gönderildi.',
    });
  }

  const quota = checkAndRecordQuota(req.playerId, 400, env);
  if (!quota.allowed) {
    return buildControlledFallbackResult({
      relationship,
      reason: quota.reason || 'Kota aşıldı.',
    });
  }

  const modelClient =
    deps.modelClient !== undefined
      ? deps.modelClient
      : env.geminiApiKey
      ? createGeminiNpcModelClient(env.geminiApiKey)
      : null;

  const openAiClient =
    deps.openAiClient !== undefined
      ? deps.openAiClient
      : env.openAiApiKey
      ? createOpenAiNpcModelClient(env.openAiApiKey, env.openAiModel)
      : null;

  if (!modelClient && !openAiClient) {
    return buildControlledFallbackResult({
      relationship,
      reason: 'GEMINI_API_KEY veya OPENAI_API_KEY tanımlı değil.',
    });
  }

  const systemInstruction = buildNpcSystemInstruction(req.npcId);
  const startedAt = Date.now();
  let turn: NpcModelTurn | null = null;
  let qualityHint: string | null = null;
  let repetitionRetried = false;
  let lastError = 'Gemini yanıtı alınamadı.';
  let answeredModel = env.geminiNpcModel;
  const models = [env.geminiNpcModel, env.geminiNpcBackupModel].filter(
    (m, i, all) => m && all.indexOf(m) === i,
  );

  // 1. AŞAMA: Birincil Sağlayıcı (Gemini)
  if (modelClient) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const remainingMs = env.npcChatTimeoutMs - (Date.now() - startedAt);
      if (remainingMs < MIN_ATTEMPT_BUDGET_MS) {
        lastError = 'Gemini zaman bütçesi doldu.';
        break;
      }

      const attemptStartedAt = Date.now();
      let generated: { raw: string; model: string };
      try {
        generated = await generateWithHedge(
          modelClient,
          {
            systemInstruction,
            input: buildNpcConversationPrompt({
              npcId: req.npcId,
              relationship,
              playerMessage: sanitized,
              playerName: req.playerName,
              playerStyle: req.playerStyle,
              gameDay: req.gameDay,
              clock: req.clock,
              playerLocationLabel: req.playerLocationLabel,
              activeTaskTitle: req.activeTaskTitle,
              qualityRetryHint: qualityHint,
            }),
          },
          models,
          env.npcHedgeAfterMs,
          remainingMs,
        );
      } catch (err: any) {
        lastError = err?.message || 'Gemini çağrısı başarısız oldu.';
        log(
          `[npc-chat] uid=${req.playerId} npc=${req.npcId} attempt=${attempt + 1} ERROR ${Date.now() - attemptStartedAt}ms: ${lastError}`,
        );
        break;
      }

      const normalized = normalizeNpcModelOutput(generated.raw);
      log(
        `[npc-chat] uid=${req.playerId} npc=${req.npcId} model=${generated.model} attempt=${attempt + 1} ${
          normalized.valid ? 'OK' : `INVALID (${normalized.errors.join(' ')})`
        } ${Date.now() - attemptStartedAt}ms`,
      );
      if (!normalized.valid || !normalized.turn) {
        lastError = normalized.errors.join(' ') || 'Gemini boş yanıt döndürdü.';
        continue;
      }

      const issue = findReplyQualityIssue(
        normalized.turn.npcReply,
        relationship.recentMessages,
      );
      turn = normalized.turn;
      answeredModel = generated.model;
      if (issue && attempt === 0) {
        qualityHint = issue;
        repetitionRetried = true;
        continue;
      }
      break;
    }
  }

  // 2. AŞAMA: İkincil Sağlayıcı (OpenAI Fallback — gpt-4o-mini)
  if (!turn && openAiClient) {
    const remainingMs = Math.max(
      MIN_ATTEMPT_BUDGET_MS,
      env.npcChatTimeoutMs - (Date.now() - startedAt),
    );
    log(
      `[npc-chat] Gemini yanıt vermedi (${lastError}). Kullanıcıya hata göstermeden OpenAI (${env.openAiModel}) fallback devreye alınıyor...`,
    );

    try {
      const openAiRaw = await openAiClient({
        model: env.openAiModel,
        systemInstruction,
        input: buildNpcConversationPrompt({
          npcId: req.npcId,
          relationship,
          playerMessage: sanitized,
          playerName: req.playerName,
          playerStyle: req.playerStyle,
          gameDay: req.gameDay,
          clock: req.clock,
          playerLocationLabel: req.playerLocationLabel,
          activeTaskTitle: req.activeTaskTitle,
          qualityRetryHint: qualityHint,
        }),
        timeoutMs: remainingMs,
      });

      if (openAiRaw) {
        const normalized = normalizeNpcModelOutput(openAiRaw);
        if (normalized.valid && normalized.turn) {
          turn = normalized.turn;
          answeredModel = env.openAiModel;
          log(`[npc-chat] OpenAI fallback başarıyla tamamlandı (${answeredModel}).`);
        } else {
          lastError = normalized.errors.join(' ') || 'OpenAI geçersiz JSON yanıt döndürdü.';
        }
      }
    } catch (openAiErr: any) {
      lastError = openAiErr?.message || 'OpenAI çağrısı başarısız oldu.';
      log(`[npc-chat] OpenAI fallback da başarısız: ${lastError}`);
    }
  }

  if (!turn) {
    return buildControlledFallbackResult({ relationship, reason: lastError });
  }

  const applied = applyNpcTurnToRelationship({
    relationship,
    playerMessage: sanitized,
    turn,
    gameDay: req.gameDay,
  });
  const saved = store.saveNpcRelationship(
    req.playerId,
    req.playerId,
    applied.relationship,
  );

  return {
    status: 'ok',
    npcReply: turn.npcReply,
    detectedIntent: turn.intent,
    updatedRelationship: saved,
    relationshipChange: {
      familiarityDelta: applied.appliedFamiliarityDelta,
      trustDelta: applied.appliedTrustDelta,
      reason: turn.relationshipReason,
    },
    gameplayEffects: computeGameplayEffects({
      npcId: req.npcId,
      intent: turn.intent,
      appliedFamiliarityDelta: applied.appliedFamiliarityDelta,
    }),
    isFallback: false,
    source: answeredModel.includes('gpt') ? 'openai_fallback' : 'gemini_live',
    model: answeredModel,
    repetitionRetried,
  };
}
