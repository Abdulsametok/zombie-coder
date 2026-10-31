import fs from 'fs';
import path from 'path';

export interface BackendEnvConfig {
  geminiApiKey: string;
  geminiModel: string;
  port: number;
  dailyTokenBudgetPerPlayer: number;
  maxRequestsPerMinutePerPlayer: number;
}

/**
 * Yalnızca sunucu (Cloud Run / Node backend) tarafında çalışan .env okuyucu.
 * İstemci paketine (Metro bundle) dahil edilmez.
 */
export function loadBackendEnv(customEnvPath?: string): BackendEnvConfig {
  let apiKey = process.env.GEMINI_API_KEY || '';

  const envFile = customEnvPath || path.resolve(process.cwd(), '.env');
  if (!apiKey && fs.existsSync(envFile)) {
    const raw = fs.readFileSync(envFile, 'utf8');
    const lines = raw
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('GEMINI_API_KEY=')) {
        apiKey = line.slice('GEMINI_API_KEY='.length).trim();
        break;
      }
      if (line.startsWith('ApiKey=')) {
        apiKey = line.slice('ApiKey='.length).trim();
        break;
      }
      if (line.toLowerCase() === 'apikey' && lines[i + 1]) {
        apiKey = lines[i + 1].trim();
        break;
      }
    }

    if (!apiKey && lines.length === 1 && !lines[0].includes('=')) {
      apiKey = lines[0];
    }
  }

  return {
    geminiApiKey: apiKey,
    geminiModel: process.env.GEMINI_MODEL || 'models/gemini-3.8-flash',
    port: Number(process.env.PORT || 8080),
    dailyTokenBudgetPerPlayer: Number(
      process.env.DAILY_TOKEN_BUDGET_PER_PLAYER || 50000,
    ),
    maxRequestsPerMinutePerPlayer: Number(
      process.env.MAX_RPM_PER_PLAYER || 10,
    ),
  };
}
