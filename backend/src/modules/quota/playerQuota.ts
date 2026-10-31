import { BackendEnvConfig, loadBackendEnv } from '../../config/env';

interface PlayerQuotaUsage {
  requestsInCurrentWindow: number;
  windowStartedAt: number;
  estimatedTokensToday: number;
}

const quotaTracker = new Map<string, PlayerQuotaUsage>();

/** Oyuncu başına dakikalık istek ve günlük token bütçesi kontrolü. */
export function checkAndRecordQuota(
  playerId: string,
  tokenCost = 650,
  env: BackendEnvConfig = loadBackendEnv(),
): {
  allowed: boolean;
  reason?: string;
} {
  const now = Date.now();
  const current = quotaTracker.get(playerId) || {
    requestsInCurrentWindow: 0,
    windowStartedAt: now,
    estimatedTokensToday: 0,
  };

  if (now - current.windowStartedAt > 60_000) {
    current.requestsInCurrentWindow = 0;
    current.windowStartedAt = now;
  }

  if (current.requestsInCurrentWindow >= env.maxRequestsPerMinutePerPlayer) {
    return {
      allowed: false,
      reason: 'Dakikalık AI istek limiti aşıldı.',
    };
  }

  if (current.estimatedTokensToday >= env.dailyTokenBudgetPerPlayer) {
    return {
      allowed: false,
      reason: 'Günlük oyuncu token bütçesi doldu.',
    };
  }

  current.requestsInCurrentWindow += 1;
  current.estimatedTokensToday += tokenCost;
  quotaTracker.set(playerId, current);
  return { allowed: true };
}
