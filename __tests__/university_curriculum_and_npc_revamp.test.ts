import {
  UNIVERSITY_LECTURES,
  SEMESTER_EXAMS,
  evaluateStudentAnswer,
} from '../src/features/curriculum/lectureCatalog';
import {
  getFirstMeetingPrompts,
  NPC_PERSONAS,
} from '../src/features/social/npcRelationshipEngine';
import { WORLD_MAPS } from '../src/game/maps/worldMaps';

describe('NPC Tanışma Diyalogları ve Karakter Revizyonları', () => {
  test('Koç Burak ilk karşılaşma metni ve hazır seçenekleri (a & b) doğrulanmalı', () => {
    const coachPersona = NPC_PERSONAS.coach_burak;
    expect(coachPersona.firstMeetingGreeting).toBe(
      'Merhaba, hoş geldin! Ben Koç Burak. Burada sana sağlıklı yaşam, motivasyon ve satış stratejileriyle alakalı bilgiler verebilirim. Adın ne?',
    );

    const prompts = getFirstMeetingPrompts('Mert', 'coach_burak');
    expect(prompts).toHaveLength(2);
    expect(prompts[0].messageText).toBe(
      'Merhaba Koç, ben Mert. Hem formda kalmak hem de satış dinamiklerini öğrenmek istiyorum.',
    );
    expect(prompts[1].messageText).toBe(
      'Selam! Yazılımcı kafasıyla spora ve satış taktiklerine sıfırdan başlıyorum.',
    );
  });

  test('Prof. Demir akademik tondadır, samimi seçenekler kaldırılmıştır (a & b)', () => {
    const prompts = getFirstMeetingPrompts('Zeynep', 'prof_demir');
    expect(prompts).toHaveLength(2);
    expect(prompts[0].messageText).toBe(
      'Merhaba hocam, ben Zeynep. Dersi dinlemek ve kendimi geliştirmek için buradayım.',
    );
    expect(prompts[1].messageText).toBe(
      'Saygılar hocam, okulun ilk günündeyim. Yazılım mühendisliği dersinizi heyecanla bekliyordum.',
    );

    // Hiçbir samimi kalıp olmamalıdır
    prompts.forEach(p => {
      expect(p.messageText.toLowerCase()).not.toContain('naber');
      expect(p.messageText.toLowerCase()).not.toContain('dostum');
    });
  });

  test('Kaan hazır diyalogları bozulmadan korunmalı', () => {
    const prompts = getFirstMeetingPrompts('Ali', 'kaan_mentor');
    expect(prompts).toHaveLength(2);
    expect(prompts[0].messageText).toBe('Merhaba, ben Ali. Okuldaki ilk günüm.');
    expect(prompts[1].messageText).toBe('Selam dostum, naber? Ben Ali.');
  });
});

describe('Üniversite Ders Döngüsü & Değerlendirme Mekaniği', () => {
  test('Kampüs haritasındaki lab bilgisayarı "Derse Başla" olarak etiketlenmelidir', () => {
    const uniMap = WORLD_MAPS.university;
    const labWorkstation = uniMap.interactions.find(
      s => s.id === 'lab_workstation_left',
    );
    expect(labWorkstation).toBeDefined();
    expect(labWorkstation?.label).toBe('Derse Başla');
    expect(labWorkstation?.badgeText).toBe('Ders Tahtası');
  });

  test('Ders içi soru anlamsal değerlendirmesi: >= %70 onaylayıcı ilerler', () => {
    const lecture1 = UNIVERSITY_LECTURES[0];
    const answer =
      'Yazılımcının asıl sorumluluğu sistem mimarisi ve denetimidir. LLM tarafından üretilen kodun spesifikasyonunu ve doğruluğunu filtreleyip denetlemelidir.';

    const result = evaluateStudentAnswer(answer, lecture1.question);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.isPassed).toBe(true);
    expect(result.professorFeedback).toContain(lecture1.question.successFeedback);
  });

  test('Ders içi soru anlamsal değerlendirmesi: < %70 için hoca tam beklenen formatta özet sunar', () => {
    const lecture1 = UNIVERSITY_LECTURES[0];
    const poorAnswer = 'ezber';

    const result = evaluateStudentAnswer(poorAnswer, lecture1.question);
    expect(result.score).toBeLessThan(70);
    expect(result.isPassed).toBe(false);
    expect(result.professorFeedback).toBe(
      `Sanırım yanlış düşünüyorsun; derste bahsettiğimiz üzere bu konunun temel mantığı şöyle olmalı: ${lecture1.question.correctApproachSummary}`,
    );
  });

  test('Tamamlanan 5 dersten sonra sınav oturumu ve vize soruları hazırdır', () => {
    expect(UNIVERSITY_LECTURES.length).toBeGreaterThanOrEqual(5);
    const exam1 = SEMESTER_EXAMS[0];
    expect(exam1).toBeDefined();
    expect(exam1.examNumber).toBe(1);
    expect(exam1.questions.length).toBe(5);
    expect(exam1.passingScore).toBe(70);
  });
});

import {
  buildInCharacterFallbackResult,
  getInCharacterOfflineFallbackReply,
  createInitialNpcRelationships,
} from '../src/features/social/npcRelationshipEngine';
import { chatWithNpc } from '../backend/src/modules/npc/npcConversationService';
import { IsolatedFirestoreWorldStore } from '../backend/src/modules/world/firestoreWorldStore';

describe('Çift Katmanlı (Gemini -> OpenAI Fallback) & Nihai Güvenlik Ağı', () => {
  test('Gemini hata verirse veya çökerse, OpenAI (gpt-4o-mini) anında devreye girmeli', async () => {
    const store = new IsolatedFirestoreWorldStore();
    const failingGeminiClient = jest.fn().mockRejectedValue(new Error('503 Service Unavailable'));
    const successfulOpenAiClient = jest.fn().mockResolvedValue(
      JSON.stringify({
        npcReply: 'OpenAI üzerinden gelen canlı cevap!',
        intent: 'greeting',
        familiarityDelta: 2,
        trustDelta: 1,
        relationshipReason: 'OpenAI fallback başarılı.',
        memoryToConfirm: null,
        sharedExperienceToAdd: null,
        relationshipSummaryUpdate: null,
      }),
    );

    const result = await chatWithNpc(
      {
        playerId: 'player_a_deniz',
        npcId: 'coach_burak',
        playerMessage: 'Selam Koç, form durumu nasıl?',
        playerName: 'Deniz',
        playerStyle: 'casual',
        gameDay: 1,
      },
      {
        store,
        modelClient: failingGeminiClient,
        openAiClient: successfulOpenAiClient,
        env: {
          geminiApiKey: 'mock-gemini',
          geminiModel: 'gemini-1.5-flash',
          geminiNpcModel: 'gemini-1.5-flash',
          geminiNpcBackupModel: '',
          openAiApiKey: 'mock-openai',
          openAiModel: 'gpt-4o-mini',
          npcHedgeAfterMs: 5000,
          npcChatTimeoutMs: 25000,
          port: 8080,
          dailyTokenBudgetPerPlayer: 50000,
          maxRequestsPerMinutePerPlayer: 10,
        },
        logger: () => {},
      },
    );

    expect(failingGeminiClient).toHaveBeenCalled();
    expect(successfulOpenAiClient).toHaveBeenCalled();
    expect(result.status).toBe('ok');
    expect(result.isFallback).toBe(false);
    expect(result.source).toBe('openai_fallback');
    expect(result.npcReply).toBe('OpenAI üzerinden gelen canlı cevap!');
  });

  test('Hem Gemini hem OpenAI yanıt vermezse, ekranda kırmızı hata basılmadan NPC kişiliğine uygun hazır yanıt gösterilmeli', () => {
    const rels = createInitialNpcRelationships('player_test');

    // Koç Burak
    const coachFallback = buildInCharacterFallbackResult({ relationship: rels.coach_burak });
    expect(coachFallback.status).toBe('ok');
    expect(coachFallback.isFallback).toBe(false);
    expect(coachFallback.source).toBe('offline_mock');
    expect(coachFallback.npcReply).toBe(
      'Şu an salonda set aralarındayım, hemen toparlayıp geliyorum; birazdan tekrar konuşalım şampiyon!',
    );

    // Prof. Demir
    const profFallback = buildInCharacterFallbackResult({ relationship: rels.prof_demir });
    expect(profFallback.npcReply).toBe(
      'Şu an amfide tahtadaki notları toparlıyorum; birazdan veya bir sonraki derste bu konuyu detaylandıralım.',
    );

    // Kaan
    const kaanFallback = buildInCharacterFallbackResult({ relationship: rels.kaan_mentor });
    expect(kaanFallback.npcReply).toBe(
      'Kafamı projeden yeni kaldırdım, biraz kod toparlıyorum; birkaç dakikaya tekrar konuşalım dostum!',
    );

    // Asistan Elif
    const elifFallback = buildInCharacterFallbackResult({ relationship: rels.asistan_elif });
    expect(elifFallback.npcReply).toBe(
      'Laboratuvardaki test cihazlarını kalibre ediyordum; hemen toparlayıp döneceğim, birazdan konuşalım.',
    );
  });
});
