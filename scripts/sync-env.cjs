const fs = require('fs');
const path = require('path');

function syncEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const targetConfigPath = path.join(__dirname, '..', 'src', 'config', 'clientAiConfig.ts');

  if (!fs.existsSync(envPath)) {
    console.warn('[SyncEnv] .env dosyasi bulunamadi, anahtarsiz config uretiliyor.');
  }

  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const matchKey = (regexes) => {
    for (const r of regexes) {
      const match = envContent.match(r);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const geminiApiKey = matchKey([
    /GEMINI_API_KEY\s*=\s*([^\r\n]+)/,
    /gemini_api_key\s*=\s*([^\r\n]+)/i,
  ]);

  const openAiApiKey = matchKey([
    /Open_AI_API_KEY\s*=\s*([^\r\n]+)/,
    /OPENAI_API_KEY\s*=\s*([^\r\n]+)/,
    /OPEN_AI_API_KEY\s*=\s*([^\r\n]+)/,
  ]);

  const geminiModel = matchKey([
    /GEMINI_NPC_MODEL\s*=\s*([^\r\n]+)/,
    /GEMINI_MODEL\s*=\s*([^\r\n]+)/,
  ]) || 'gemini-3.1-flash-lite';

  const openAiModel = matchKey([
    /OPENAI_MODEL\s*=\s*([^\r\n]+)/,
  ]) || 'gpt-4o-mini';

  console.log('[SyncEnv] .env dosyasindan anahtarlar senkronize ediliyor...');
  console.log(`[SyncEnv] Gemini API Key: ${geminiApiKey ? 'OK (Mevcut)' : 'EKSİK'}`);
  console.log(`[SyncEnv] OpenAI API Key: ${openAiApiKey ? 'OK (Mevcut)' : 'EKSİK'}`);
  console.log(`[SyncEnv] Gemini Model: ${geminiModel}`);
  console.log(`[SyncEnv] OpenAI Model: ${openAiModel}`);

  const outputContent = `/**
 * AUTO-GENERATED from .env by scripts/sync-env.cjs
 * Oyunun sunum veya bagimsiz derleme (AAB / APK) calismasinda
 * API anahtarlarinin dogrudan kullanilmasini saglar.
 */

export const CLIENT_AI_CONFIG = {
  geminiApiKey: ${JSON.stringify(geminiApiKey)},
  geminiModel: ${JSON.stringify(geminiModel)},
  openAiApiKey: ${JSON.stringify(openAiApiKey)},
  openAiModel: ${JSON.stringify(openAiModel)},
  timeoutMs: 25000,
};
`;

  fs.mkdirSync(path.dirname(targetConfigPath), { recursive: true });
  fs.writeFileSync(targetConfigPath, outputContent, 'utf8');
  console.log(`[SyncEnv] clientAiConfig.ts basariyla guncellendi: ${targetConfigPath}\n`);
}

if (require.main === module) {
  syncEnv();
}

module.exports = { syncEnv };
