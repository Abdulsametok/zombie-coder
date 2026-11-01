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
