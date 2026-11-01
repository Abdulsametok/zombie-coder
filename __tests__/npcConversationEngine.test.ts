import { IsolatedFirestoreWorldStore } from '../backend/src/modules/world/firestoreWorldStore';
import {
  NpcChatServiceRequest,
  NpcModelClient,
  NpcModelRequest,
  chatWithNpc,
} from '../backend/src/modules/npc/npcConversationService';
import { BackendEnvConfig } from '../backend/src/config/env';
import { normalizeGeminiModelId } from '../backend/src/config/env';
import {
  DAILY_RELATIONSHIP_GAIN_CAP,
  RELATIONSHIP_DELTA_LIMITS,
  findReplyQualityIssue,
  needsFirstMeeting,
  normalizeNpcModelOutput,
} from '../src/features/social/npcRelationshipEngine';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => {
    throw new Error('Testlerde canlı Gemini istemcisi oluşturulmamalı.');
  }),
}));

const TEST_ENV: BackendEnvConfig = {
  geminiApiKey: 'test-key',
  geminiModel: 'gemini-3.8-flash',
  geminiNpcModel: 'gemini-3.5-flash',
  geminiNpcBackupModel: 'gemini-3.5-flash-lite',
  openAiApiKey: '',
  openAiModel: 'gpt-4o-mini',
  npcHedgeAfterMs: 50,
  npcChatTimeoutMs: 20000,
  port: 0,
  dailyTokenBudgetPerPlayer: 1_000_000,
  maxRequestsPerMinutePerPlayer: 1000,
};

interface ModelReply {
  npcReply: string;
  intent?: string;
  familiarityDelta?: number;
  trustDelta?: number;
  relationshipReason?: string;
  memoryToConfirm?: string;
  sharedExperienceToAdd?: string;
  relationshipSummaryUpdate?: string;
}

/** Gemini yerine geçen, gelen istekleri kaydeden sahte model istemcisi. */
function scriptedModel(replies: Array<ModelReply | Error>): {
  client: NpcModelClient;
  calls: NpcModelRequest[];
} {
  const calls: NpcModelRequest[] = [];
  let index = 0;
  const client: NpcModelClient = async req => {
    calls.push(req);
    const next = replies[Math.min(index, replies.length - 1)];
    index += 1;
    if (next instanceof Error) {
      throw next;
    }
    return JSON.stringify({
      intent: 'small_talk',
      familiarityDelta: 1,
      trustDelta: 0,
      relationshipReason: 'Sıradan sohbet.',
      memoryToConfirm: '',
      sharedExperienceToAdd: '',
      relationshipSummaryUpdate: '',
      ...next,
    });
  };
  return { client, calls };
}

function request(
  playerId: string,
  playerMessage: string,
  overrides: Partial<NpcChatServiceRequest> = {},
): NpcChatServiceRequest {
  return {
    playerId,
    npcId: 'kaan_mentor',
    playerMessage,
    playerName: playerId === 'player_b_mert' ? 'Mert' : 'Deniz',
    playerStyle: 'casual',
    gameDay: 1,
    clock: '10:30',
    playerLocationLabel: 'ÜNİVERSİTE // BMB LAB',
    activeTaskTitle: null,
    ...overrides,
  };
}

const quiet = { logger: () => {} };

describe('AI-Native NPC Conversation Engine', () => {
  test('Her mesajda Gemini çağrılır; prompt öncelik sırasıyla son mesajı, geçmişi ve hafızayı içerir', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client, calls } = scriptedModel([
      {
        npcReply: 'Hoş geldin Deniz, ben Kaan. İlk gün kafa karışık olur, takılırsan buradayım.',
        intent: 'introduction',
        familiarityDelta: 3,
        trustDelta: 1,
        memoryToConfirm: 'Oyuncunun adı Deniz, okuldaki ilk günü.',
      },
      { npcReply: 'Hayırdır oğlum :D Daha yeni tanıştık, ne kavgası?', intent: 'provocation', familiarityDelta: 0 },
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };

    const first = await chatWithNpc(
      request('player_a_deniz', 'Merhaba, ben Deniz. Okuldaki ilk günüm.'),
      deps,
    );
    const second = await chatWithNpc(request('player_a_deniz', 'Gel kavga edelim.'), deps);

    expect(calls).toHaveLength(2);
    expect(first.source).toBe('gemini_live');
    expect(first.isFallback).toBe(false);
    expect(second.npcReply).toBe('Hayırdır oğlum :D Daha yeni tanıştık, ne kavgası?');
    expect(second.detectedIntent).toBe('provocation');

    expect(calls[0].model).toBe('gemini-3.5-flash');
    expect(calls[0].systemInstruction).toContain('Adın Kaan');
    expect(calls[0].systemInstruction).toContain('ÖNCELİK SIRASI');
    expect(calls[0].systemInstruction).toContain('Süper bir nokta yakaladın');

    const secondInput = JSON.parse(calls[1].input);
    const keys = Object.keys(secondInput);
    expect(keys[0]).toBe('oncelik_1_oyuncunun_son_mesaji_ve_baglam');
    expect(keys[keys.length - 1]).toBe('oncelik_5_uzmanlik_ve_gorev_yalnizca_gerekirse');
    expect(secondInput.oncelik_1_oyuncunun_son_mesaji_ve_baglam.oyuncunun_son_mesaji).toBe(
      'Gel kavga edelim.',
    );
    const history = secondInput.oncelik_1_oyuncunun_son_mesaji_ve_baglam.son_konusma_gecmisi;
    expect(history.map((m: any) => m.mesaj)).toEqual([
      'Merhaba, ben Deniz. Okuldaki ilk günüm.',
      'Hoş geldin Deniz, ben Kaan. İlk gün kafa karışık olur, takılırsan buradayım.',
    ]);
    expect(secondInput.oncelik_3_iliski_gecmisi.hatirlanan_bilgiler).toContain(
      'Oyuncunun adı Deniz, okuldaki ilk günü.',
    );
  });

  test('İlk tanışma yalnızca bir kez yaşanır ve sunucuda kalıcıdır', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client, calls } = scriptedModel([
      { npcReply: 'Selam, ben Kaan. Hoş geldin.', intent: 'introduction' },
      { npcReply: 'İyidir, sen nasılsın?', intent: 'greeting' },
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };

    const before = store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor');
    expect(needsFirstMeeting(before)).toBe(true);

    const first = await chatWithNpc(request('player_a_deniz', 'Selam dostum, naber? Ben Deniz.'), deps);
    expect(JSON.parse(calls[0].input).oncelik_3_iliski_gecmisi.ilk_tanisma_mi).toBe(true);
    expect(first.updatedRelationship.hasMet).toBe(true);
    expect(first.updatedRelationship.firstMetAt).toBeTruthy();

    const stored = store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor');
    expect(needsFirstMeeting(stored)).toBe(false);

    await chatWithNpc(request('player_a_deniz', 'Naber lan?'), deps);
    expect(JSON.parse(calls[1].input).oncelik_3_iliski_gecmisi.ilk_tanisma_mi).toBe(false);
  });

  test('Gemini hatasında kontrollü fallback döner: AI cevabı gibi sunulmaz, ilişki ve hafıza değişmez', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client } = scriptedModel([new Error('503 UNAVAILABLE')]);
    const before = store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor');

    const result = await chatWithNpc(request('player_a_deniz', 'Selam.'), {
      store,
      modelClient: client,
      env: TEST_ENV,
      ...quiet,
    });

    expect(result.isFallback).toBe(true);
    expect(result.status).toBe('fallback');
    expect(result.source).toBe('controlled_fallback');
    expect(result.fallbackReason).toContain('503');
    expect(result.npcReply).toContain('şu an cevap veremiyor');
    expect(result.updatedRelationship).toEqual(before);
    expect(
      store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor'),
    ).toEqual(before);

    const noKey = await chatWithNpc(request('player_a_deniz', 'Selam.'), {
      store,
      modelClient: null,
      env: { ...TEST_ENV, geminiApiKey: '' },
      ...quiet,
    });
    expect(noKey.isFallback).toBe(true);
    expect(noKey.fallbackReason).toContain('GEMINI_API_KEY');
  });

  test('Önceki cevabın tekrarı veya yağcı kalıp ifade bir kez yeniden ürettirilir', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const repeated = 'Olur öyle günler, kafanı zorlama bugün.';
    const { client, calls } = scriptedModel([
      { npcReply: repeated, intent: 'venting_or_low_mood' },
      { npcReply: 'Olur öyle günler, kafanı zorlama bugün!', intent: 'venting_or_low_mood' },
      { npcReply: 'Yine mi o hal? Gel bir çay söyleyeyim, anlat bakalım ne oldu.', intent: 'venting_or_low_mood' },
      { npcReply: 'Süper bir nokta yakaladın! Projeye nasıl başlayacaksın?', intent: 'project_talk' },
      { npcReply: 'Önce ne yapmak istediğini bir cümleyle söyle, gerisini birlikte böleriz.', intent: 'project_talk' },
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };

    await chatWithNpc(request('player_a_deniz', 'Bugün hiç ders çalışasım yok.'), deps);
    const second = await chatWithNpc(request('player_a_deniz', 'Bugün yine hiç halim yok.'), deps);

    expect(calls).toHaveLength(3);
    expect(second.repetitionRetried).toBe(true);
    expect(second.npcReply).toBe('Yine mi o hal? Gel bir çay söyleyeyim, anlat bakalım ne oldu.');
    expect(JSON.parse(calls[2].input).oncelik_1_oyuncunun_son_mesaji_ve_baglam.uyari).toContain(
      'Önceki cevaba çok benziyor',
    );

    const third = await chatWithNpc(request('player_a_deniz', 'Bir proje yapmak istiyorum.'), deps);
    expect(calls).toHaveLength(5);
    expect(third.npcReply).not.toContain('Süper bir nokta yakaladın');
    expect(
      findReplyQualityIssue('Harika bir soru! Bence evet.', []),
    ).toContain('Yasaklı kalıp');
  });

  test('İlişki değişimleri kademeli, gerekçeli ve gün başına sınırlıdır; şaka/kışkırtma ilişkiyi savurmaz', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client } = scriptedModel([
      { npcReply: 'Ne kavgası ya, hayırdır?', intent: 'provocation', familiarityDelta: -40, trustDelta: -40 },
      ...Array.from({ length: 6 }, (_, i) => ({
        npcReply: `Farklı cevap numarası ${i} — bugün kampüs ${['sakin', 'kalabalık', 'gürültülü', 'soğuk', 'sıcak', 'tuhaf'][i]}.`,
        intent: 'small_talk',
        familiarityDelta: 50,
        trustDelta: 50,
        relationshipReason: 'Keyifli sohbet.',
      })),
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };
    const start = store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor');

    const provocation = await chatWithNpc(request('player_a_deniz', 'Gel kavga edelim.'), deps);
    expect(provocation.relationshipChange.familiarityDelta).toBe(-1);
    expect(provocation.relationshipChange.trustDelta).toBe(-1);
    expect(provocation.updatedRelationship.familiarity).toBe(start.familiarity - 1);

    let last = provocation;
    for (let i = 0; i < 6; i++) {
      last = await chatWithNpc(request('player_a_deniz', `Mesaj ${i}`), deps);
      expect(last.relationshipChange.familiarityDelta).toBeLessThanOrEqual(
        RELATIONSHIP_DELTA_LIMITS.familiarity.max,
      );
    }
    const rel = last.updatedRelationship;
    expect(rel.dailyProgress?.familiarityGained).toBe(DAILY_RELATIONSHIP_GAIN_CAP.familiarity);
    expect(rel.dailyProgress?.trustGained).toBe(DAILY_RELATIONSHIP_GAIN_CAP.trust);
    expect(rel.relationshipLog.length).toBeGreaterThan(0);
    expect(rel.relationshipLog.every(entry => entry.reason.length > 0)).toBe(true);

    const nextDay = await chatWithNpc(
      request('player_a_deniz', 'Günaydın', { gameDay: 2 }),
      deps,
    );
    expect(nextDay.relationshipChange.familiarityDelta).toBe(
      RELATIONSHIP_DELTA_LIMITS.familiarity.max,
    );
  });

  test('Tek bir şaka veya küfür oyuncuya kalıcı kişilik etiketi olarak hafızaya yazılmaz', () => {
    const labelled = normalizeNpcModelOutput({
      npcReply: 'Ne kavgası ya :D',
      intent: 'provocation',
      familiarityDelta: 0,
      trustDelta: 0,
      relationshipReason: 'Belirsiz şaka.',
      memoryToConfirm: 'Deniz kavgacı biri.',
      sharedExperienceToAdd: '',
      relationshipSummaryUpdate: 'Oyuncu saldırgan bir tip.',
    });
    expect(labelled.valid).toBe(true);
    expect(labelled.turn?.memoryToConfirm).toBeNull();
    expect(labelled.turn?.relationshipSummaryUpdate).toBeNull();

    const event = normalizeNpcModelOutput({
      npcReply: 'Geçmiş olsun.',
      intent: 'venting_or_low_mood',
      memoryToConfirm: 'Deniz ilk vizesindeki başarısızlıktan dolayı moralsizdi.',
    });
    expect(event.turn?.memoryToConfirm).toBe(
      'Deniz ilk vizesindeki başarısızlıktan dolayı moralsizdi.',
    );

    expect(normalizeNpcModelOutput('bu json değil').valid).toBe(false);
    expect(normalizeNpcModelOutput({ npcReply: '   ' }).valid).toBe(false);
    expect(normalizeNpcModelOutput({ npcReply: 'Selam', intent: 'uydurma' }).turn?.intent).toBe(
      'ambiguous',
    );
  });

  test('NPC hafızası oyuncular arasında karışmaz', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client, calls } = scriptedModel([
      { npcReply: 'Selam Deniz, hoş geldin.', intent: 'introduction', memoryToConfirm: 'Deniz bir hava durumu uygulaması yapmak istiyor.' },
      { npcReply: 'Selam Mert, ben Kaan.', intent: 'introduction' },
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };

    const deniz = await chatWithNpc(request('player_a_deniz', 'Ben Deniz, hava durumu uygulaması yapmak istiyorum.'), deps);
    await chatWithNpc(
      request('player_b_mert', 'Ben Mert, ilk günüm.', {
        // B oyuncusu A'nın ilişki kopyasını göndererek hafızasını devralmaya çalışır
        clientRelationship: deniz.updatedRelationship,
      }),
      deps,
    );

    const mertPrompt = calls[1].input;
    expect(mertPrompt).not.toContain('hava durumu');
    expect(mertPrompt).not.toContain('Deniz');
    expect(JSON.parse(mertPrompt).oncelik_3_iliski_gecmisi.ilk_tanisma_mi).toBe(true);

    const mertRel = store.getNpcRelationship('player_b_mert', 'player_b_mert', 'kaan_mentor');
    const denizRel = store.getNpcRelationship('player_a_deniz', 'player_a_deniz', 'kaan_mentor');
    expect(mertRel.playerId).toBe('player_b_mert');
    expect(mertRel.confirmedMemories).toEqual([]);
    expect(denizRel.confirmedMemories).toContain('Deniz bir hava durumu uygulaması yapmak istiyor.');
    expect(mertRel.recentMessages.map(m => m.text)).not.toContain(
      'Ben Deniz, hava durumu uygulaması yapmak istiyorum.',
    );

    expect(() =>
      store.getNpcRelationship('player_a_deniz', 'player_b_mert', 'kaan_mentor'),
    ).toThrow(/PERMISSION_DENIED/);
    expect(() =>
      store.saveNpcRelationship('player_b_mert', 'player_b_mert', denizRel),
    ).toThrow(/PERMISSION_DENIED/);
  });

  test('Dünkü konuşma "dün" olarak işaretlenir; aktif görev yalnızca en düşük öncelikte verilir', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const { client, calls } = scriptedModel([
      { npcReply: 'Startup fikrin güzeldi, düşünmeye değer.', intent: 'project_talk' },
      { npcReply: 'Tabii, dün şu öğrenci kulübü uygulamasından bahsediyordun.', intent: 'memory_recall' },
    ]);
    const deps = { store, modelClient: client, env: TEST_ENV, ...quiet };

    await chatWithNpc(request('player_a_deniz', 'Öğrenci kulüpleri için bir uygulama düşünüyorum.', { gameDay: 3 }), deps);
    await chatWithNpc(
      request('player_a_deniz', 'Dün konuştuğumuz şeyi hatırlıyor musun?', {
        gameDay: 4,
        activeTaskTitle: 'Legacy Login Denetimi',
      }),
      deps,
    );

    const input = JSON.parse(calls[1].input);
    const history = input.oncelik_1_oyuncunun_son_mesaji_ve_baglam.son_konusma_gecmisi;
    expect(history[0]).toEqual(
      expect.objectContaining({
        ne_zaman: 'dün',
        mesaj: 'Öğrenci kulüpleri için bir uygulama düşünüyorum.',
      }),
    );
    expect(input.oncelik_5_uzmanlik_ve_gorev_yalnizca_gerekirse.oyuncunun_aktif_gorevi).toBe(
      'Legacy Login Denetimi',
    );
    expect(JSON.stringify(input.oncelik_1_oyuncunun_son_mesaji_ve_baglam)).not.toContain(
      'Legacy Login',
    );
  });

  test('Birincil model gecikirse yedek Gemini modeli paralel çağrılır ve ilk gelen gerçek cevap kullanılır', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const calledModels: string[] = [];
    const client: NpcModelClient = req => {
      calledModels.push(req.model);
      const payload = JSON.stringify({
        npcReply: req.model === 'gemini-3.5-flash' ? 'Yavaş cevap.' : 'Selam, hoş geldin!',
        intent: 'greeting',
        familiarityDelta: 1,
        trustDelta: 0,
        relationshipReason: 'Selamlaşma.',
      });
      const delay = req.model === 'gemini-3.5-flash' ? 400 : 5;
      return new Promise(resolve => setTimeout(() => resolve(payload), delay));
    };

    const result = await chatWithNpc(request('player_a_deniz', 'Selam.'), {
      store,
      modelClient: client,
      env: TEST_ENV,
      ...quiet,
    });

    expect(calledModels).toEqual(['gemini-3.5-flash', 'gemini-3.5-flash-lite']);
    expect(result.source).toBe('gemini_live');
    expect(result.model).toBe('gemini-3.5-flash-lite');
    expect(result.npcReply).toBe('Selam, hoş geldin!');
    await new Promise(resolve => setTimeout(resolve, 450));
  });

  test('Interactions API için model kimliği "models/" öneki olmadan kullanılır', () => {
    expect(normalizeGeminiModelId('models/gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(normalizeGeminiModelId('gemini-3.5-flash')).toBe('gemini-3.5-flash');
  });
});
