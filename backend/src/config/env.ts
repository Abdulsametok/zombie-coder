import fs from 'fs';
import path from 'path';

export interface BackendEnvConfig {
  geminiApiKey: string;
  geminiModel: string;
  geminiNpcModel: string;
  /** Birincil NPC modeli `npcHedgeAfterMs` içinde dönmezse paralel çağrılan model ('' = kapalı). */
  geminiNpcBackupModel: string;
  npcHedgeAfterMs: number;
  npcChatTimeoutMs: number;
  port: number;
  dailyTokenBudgetPerPlayer: number;
  maxRequestsPerMinutePerPlayer: number;
}

/**
 * Interactions API model kimliğini önek olmadan bekler; `models/gemini-x` biçimi
 * hata vermeden boş `output_text` döndürür.
 */
export function normalizeGeminiModelId(model: string): string {
  return model.trim().replace(/^models\//, '');
}

function readEnvFile(envFile: string): Record<string, string> {
  const values: Record<string, string> = {};
  if (!fs.existsSync(envFile)) {
    return values;
  }
  const lines = fs
    .readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const eq = line.indexOf('=');
    if (eq > 0) {
      values[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    } else if (line.toLowerCase() === 'apikey' && lines[i + 1]) {
      values.GEMINI_API_KEY = lines[i + 1];
    }
  }
  if (!values.GEMINI_API_KEY && values.ApiKey) {
    values.GEMINI_API_KEY = values.ApiKey;
  }
  if (!values.GEMINI_API_KEY && lines.length === 1 && !lines[0].includes('=')) {
    values.GEMINI_API_KEY = lines[0];
  }
  return values;
}

/**
 * Yalnızca sunucu (Cloud Run / Node backend) tarafında çalışan .env okuyucu.
 * İstemci paketine (Metro bundle) dahil edilmez. `process.env` her zaman önceliklidir.
 */
export function loadBackendEnv(customEnvPath?: string): BackendEnvConfig {
  const fileValues = readEnvFile(
    customEnvPath || path.resolve(process.cwd(), '.env'),
  );
  const read = (key: string): string | undefined =>
    process.env[key] || fileValues[key] || undefined;

  const geminiModel = normalizeGeminiModelId(
    read('GEMINI_MODEL') || 'gemini-3.8-flash',
  );

  return {
    geminiApiKey: read('GEMINI_API_KEY') || '',
    geminiModel,
    geminiNpcModel: normalizeGeminiModelId(
      read('GEMINI_NPC_MODEL') || 'gemini-3.5-flash',
    ),
    geminiNpcBackupModel: normalizeGeminiModelId(
      process.env.GEMINI_NPC_BACKUP_MODEL ??
        fileValues.GEMINI_NPC_BACKUP_MODEL ??
        'gemini-3.1-flash-lite',
    ),
    npcHedgeAfterMs: Number(read('NPC_HEDGE_AFTER_MS') || 6000),
    npcChatTimeoutMs: Number(read('NPC_CHAT_TIMEOUT_MS') || 20000),
    port: Number(read('PORT') || 8080),
    dailyTokenBudgetPerPlayer: Number(
      read('DAILY_TOKEN_BUDGET_PER_PLAYER') || 50000,
    ),
    maxRequestsPerMinutePerPlayer: Number(read('MAX_RPM_PER_PLAYER') || 10),
  };
}
