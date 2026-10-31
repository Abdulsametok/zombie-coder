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
            max_output_tokens: 2048,
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
  if (!modelClient) {
    return buildControlledFallbackResult({
      relationship,
      reason: 'GEMINI_API_KEY tanımlı değil.',
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
    source: 'gemini_live',
    model: answeredModel,
    repetitionRetried,
  };
}
