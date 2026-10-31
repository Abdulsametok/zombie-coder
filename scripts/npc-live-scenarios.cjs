/**
 * Canlı NPC senaryo testi: backend'i gerçek HTTP sunucusu olarak başlatır ve
 * `/v1/npc/chat` üzerinden gerçek Gemini çağrılarıyla test senaryolarını çalıştırır.
 *
 *   node scripts/npc-live-scenarios.cjs
 */
process.env.MAX_RPM_PER_PLAYER = process.env.MAX_RPM_PER_PLAYER || '100';

require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js'],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  babelrc: false,
  configFile: false,
  ignore: [/node_modules/],
});

const fs = require('fs');
const path = require('path');
const { createBackendServer } = require('../backend/src/index');
const {
  createInitialNpcRelationships,
  replySimilarity,
  findReplyQualityIssue,
} = require('../src/features/social/npcRelationshipEngine');

const SCENARIO_MESSAGES = [
  'Selam.',
  'Ben Deniz, ilk günüm.',
  'Naber lan?',
  'Gel kavga edelim.',
  'Bugün hiç ders çalışasım yok.',
  'Sence AI yazılımcıların yerini alacak mı?',
  'Bir proje yapmak istiyorum.',
  'Bana proje planı çıkar.',
  'Boş ver projeyi, bugün moralim bozuk.',
  'Dün konuştuğumuz şeyi hatırlıyor musun?',
];

function seededRelationship(playerId, familiarity, trust, extra) {
  const base = createInitialNpcRelationships(playerId).kaan_mentor;
  return {
    ...base,
    hasMet: true,
    firstMetAt: '2026-10-20T10:00:00.000Z',
    familiarity,
    trust,
    interactionCount: 14,
    relationshipSummary: extra.summary,
    confirmedMemories: extra.memories,
    sharedExperiences: extra.experiences,
    recentMessages: extra.recent,
  };
}

async function main() {
  const server = createBackendServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  async function chat(uid, body) {
    const t = Date.now();
    const res = await fetch(`${base}/v1/npc/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Player-Uid': uid },
      body: JSON.stringify({ npcId: 'kaan_mentor', playerStyle: 'casual', ...body }),
    });
    const data = await res.json();
    return { ...data.result, elapsedMs: Date.now() - t };
  }

  const players = [
    {
      uid: 'player_a_deniz',
      name: 'Deniz',
      label: 'İLK TANIŞMA (yeni oyuncu)',
      relationship: undefined,
    },
    {
      uid: 'player_c_zeynep',
      name: 'Zeynep',
      label: 'TANIDIK (yakınlık 40)',
      relationship: seededRelationship('player_c_zeynep', 40, 38, {
        summary: 'Birkaç kez kampüste sohbet ettiler; rahat bir tanışıklık.',
        memories: ['Zeynep 3. sınıf, yapay zekâ ile ilgileniyor.'],
        experiences: ['Kütüphane önünde vize stresini konuştular.'],
        recent: [],
      }),
    },
    {
      uid: 'player_b_mert',
      name: 'Mert',
      label: 'YAKIN ARKADAŞ (yakınlık 75)',
      relationship: seededRelationship('player_b_mert', 75, 70, {
        summary: 'Yakın arkadaşlar; sık sık şakalaşıyorlar.',
        memories: [
          'Mert kampüs için bir yemekhane menü uygulaması yapmak istiyor.',
          'Mert basketbol oynamayı seviyor.',
        ],
        experiences: ['Hackathon gecesi birlikte sabahladılar.'],
        recent: [],
      }),
    },
  ];

  const report = [];
  for (const player of players) {
    console.log(`\n=== ${player.name} — ${player.label} ===`);
    let relationship = player.relationship;
    for (let i = 0; i < SCENARIO_MESSAGES.length; i++) {
      const msg = SCENARIO_MESSAGES[i].replace('Deniz', player.name);
      const gameDay = i === SCENARIO_MESSAGES.length - 1 ? 2 : 1;
      const result = await chat(player.uid, {
        playerMessage: msg,
        playerName: player.name,
        gameDay,
        clock: '11:00',
        playerLocationLabel: 'ÜNİVERSİTE // BMB LAB',
        relationship,
      });
      relationship = result.updatedRelationship;
      const row = {
        player: player.name,
        level: player.label,
        message: msg,
        reply: result.npcReply,
        intent: result.detectedIntent,
        source: result.source,
        model: result.model,
        retried: Boolean(result.repetitionRetried),
        familiarityDelta: result.relationshipChange && result.relationshipChange.familiarityDelta,
        trustDelta: result.relationshipChange && result.relationshipChange.trustDelta,
        reason: result.relationshipChange && result.relationshipChange.reason,
        elapsedMs: result.elapsedMs,
      };
      report.push(row);
      console.log(
        `\n> ${msg}\n< ${row.reply}\n  [${row.source}${row.model ? ' ' + row.model : ''} | niyet=${row.intent} | yakınlık ${row.familiarityDelta} güven ${row.trustDelta} | ${row.elapsedMs}ms${row.retried ? ' | tekrar nedeniyle yeniden üretildi' : ''}]`,
      );
    }
  }

  // Tekrar analizi
  console.log('\n=== TEKRAR / KALIP ANALİZİ ===');
  for (const player of players) {
    const rows = report.filter(r => r.player === player.name);
    const replies = rows.filter(r => r.source === 'gemini_live').map(r => r.reply);
    const fallbacks = rows.length - replies.length;
    const models = rows.reduce((acc, r) => {
      if (r.model) {
        acc[r.model] = (acc[r.model] || 0) + 1;
      }
      return acc;
    }, {});
    console.log(
      `${player.name}: canlı Gemini cevabı=${replies.length}/${rows.length}, kontrollü fallback=${fallbacks}, modeller=${JSON.stringify(models)}`,
    );
    let maxSim = 0;
    let pair = null;
    for (let i = 0; i < replies.length; i++) {
      for (let j = i + 1; j < replies.length; j++) {
        const s = replySimilarity(replies[i], replies[j]);
        if (s > maxSim) {
          maxSim = s;
          pair = [i, j];
        }
      }
    }
    const banned = replies.filter(r => findReplyQualityIssue(r, []) !== null).length;
    const nameMentions = replies.filter(r => r.includes(player.name)).length;
    console.log(
      `${player.name}: en yüksek cevap benzerliği=${maxSim.toFixed(2)} (mesaj ${pair ? pair.map(p => p + 1).join(' & ') : '-'}), yasaklı kalıp=${banned}, adını kullandığı cevap=${nameMentions}/${replies.length}`,
    );
  }

  // Hafıza izolasyonu: her oyuncunun sunucudaki Kaan hafızası yalnızca kendi verisini içerir
  console.log('\n=== HAFIZA İZOLASYONU ===');
  const otherNames = ['Deniz', 'Zeynep', 'Mert'];
  for (const player of players) {
    const res = await fetch(`${base}/v1/npc/relationships`, {
      headers: { 'X-Player-Uid': player.uid },
    });
    const data = await res.json();
    const rel = data.relationships.kaan_mentor;
    const memoryBlob = JSON.stringify(rel);
    const leaked = otherNames.filter(n => n !== player.name && memoryBlob.includes(n));
    console.log(
      `${player.name}: playerId=${rel.playerId}, mesaj=${rel.recentMessages.length}, hatıralar=${rel.confirmedMemories.length}, diğer oyuncu adı sızıntısı=${leaked.length ? leaked.join(',') : 'yok'}`,
    );
    console.log(`   özet: ${rel.relationshipSummary}`);
    console.log(`   hatıralar: ${JSON.stringify(rel.confirmedMemories)}`);
  }

  const outFile = path.join(require('os').tmpdir(), 'npc-live-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\nRapor: ${outFile}`);
  server.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
