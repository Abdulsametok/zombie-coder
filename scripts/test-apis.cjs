const fs = require('fs');
const path = require('path');
const { syncEnv } = require('./sync-env.cjs');

async function testAllApis() {
  console.log('====================================================');
  console.log('  ZOMBIE CODER — SUNUM ÖNCESİ CANLI API DENETİMİ   ');
  console.log('====================================================\n');

  syncEnv();

  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

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

  const geminiModel = 'gemini-3.1-flash-lite';
  const openAiModel = 'gpt-4o-mini';

  let openAiOk = false;
  let geminiOk = false;

  // 1. OpenAI Test
  console.log(`[1/2] OpenAI API (${openAiModel}) test ediliyor...`);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        messages: [{ role: 'user', content: 'Say "OK"' }],
        max_tokens: 10,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  -> ✅ OpenAI API Calisiyor! Yanit: "${data.choices?.[0]?.message?.content?.trim()}"`);
      openAiOk = true;
    } else {
      const errText = await res.text();
      console.error(`  -> ❌ OpenAI Hatasi: HTTP ${res.status} - ${errText.slice(0, 100)}`);
    }
  } catch (e) {
    console.error(`  -> ❌ OpenAI Baglanti Hatasi: ${e.message}`);
  }

  // 2. Gemini Test
  console.log(`\n[2/2] Google Gemini API (${geminiModel}) test ediliyor...`);
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const res = await ai.interactions.create({
      model: geminiModel,
      input: 'Say "OK"',
    });
    console.log(`  -> ✅ Gemini API Calisiyor! Yanit: "${res.output_text?.trim()}"`);
    geminiOk = true;
  } catch (e) {
    console.error(`  -> ❌ Gemini Hatasi: ${e.message}`);
  }

  console.log('\n----------------------------------------------------');
  if (openAiOk && geminiOk) {
    console.log('  SONUC: HER İKİ API DE %100 ÇALIŞIYOR. SUNUM İÇİN HAZIR! 🚀');
  } else if (openAiOk) {
    console.log('  SONUC: OpenAI %100 ÇALIŞIYOR (Ana ve Fallback motoru devrede). SUNUM YAPILABİLİR! ✅');
  } else {
    console.warn('  UYARI: API baglantisinda kesinti var, lutfen ag baglantinizi kontrol edin.');
  }
  console.log('----------------------------------------------------\n');

  return { openAiOk, geminiOk };
}

if (require.main === module) {
  testAllApis();
}

module.exports = { testAllApis };
