/**
 * Zombie Coder — Gün Sonu Zorunlu Günlük & Personalzy Değerlendirme Motoru
 * `plan.md` Bölüm 3.2, 4.4 ve `agent.md` JSON şemasına birebir uyumludur.
 */

import { EngineeringMetricKey } from '../tasks/taskCatalog';

export interface JournalQuestionTemplate {
  id: string;
  contextType:
    | 'passive_day'
    | 'trap_triggered'
    | 'task_completed'
    | 'gym_social'
    | 'low_energy';
  questionText: string;
  quickAnswers: Array<{
    id: string;
    label: string;
    tag: string;
    tone: 'trusting' | 'skeptical' | 'auditor' | 'tired';
  }>;
}

/**
 * `agent.md` içerisindeki Personalzy JSON çıktı şeması:
 */
export interface PersonalzyEvaluationResult {
  gunluk_ozeti: string;
  tespit_edilen_durum: string;
  metrik_degisimleri: Record<EngineeringMetricKey, number>;
  ertesi_gun_remediasyon_gorevi: {
    gorev_adi: string;
    hedef_beceri: string;
    aciklama: string;
    gorevi_veren_npc: string;
  };
  oyuncuya_mesaj: string;
}

export const JOURNAL_QUESTION_POOL: JournalQuestionTemplate[] = [
  {
    id: 'q_ai_code_trust_1',
    contextType: 'task_completed',
    questionText:
      'Bugün yapay zekanın ürettiği kod hakkında ne hissettin? Güvendin mi yoksa şüphelendin mi?',
    quickAnswers: [
      {
        id: 'qa_trust_fast',
        label: 'Hemen güvendim',
        tag: '#hızlı-akış',
        tone: 'trusting',
      },
      {
        id: 'qa_tested_carefully',
        label: 'Şüphelendim ve test ettim',
        tag: '#sağlamcı',
        tone: 'skeptical',
      },
      {
        id: 'qa_caught_big_bug',
        label: 'Büyük açık yakaladım!',
        tag: '#denetçi',
        tone: 'auditor',
      },
    ],
  },
  {
    id: 'q_trap_reflection_1',
    contextType: 'trap_triggered',
    questionText:
      'Bugün incelediğin kodda gözden kaçan bir nokta oldu. Sence hangi aşamada acele ettin?',
    quickAnswers: [
      {
        id: 'qa_skipped_reading',
        label: 'Kodu satır satır okumadan geçtim',
        tag: '#okuma-eksiği',
        tone: 'trusting',
      },
      {
        id: 'qa_missed_edge_case',
        label: 'Sınır durumları (edge-case) test etmedim',
        tag: '#test-notu',
        tone: 'skeptical',
      },
      {
        id: 'qa_was_tired',
        label: 'Yorgundum, yarın küçük adımla telafi edeceğim',
        tag: '#mola-lazım',
        tone: 'tired',
      },
    ],
  },
  {
    id: 'q_passive_day_1',
    contextType: 'passive_day',
    questionText:
      'Bugün bilgisayar başında yoğun bir görev yapmadın. Günün nasıl geçti, yarın küçük bir adım ister misin?',
    quickAnswers: [
      {
        id: 'qa_rested_well',
        label: 'Zihnimi dinlendirdim, yarına hazırım',
        tag: '#enerji-toplama',
        tone: 'skeptical',
      },
      {
        id: 'qa_explored_campus',
        label: 'Kampüsü ve spor salonunu keşfettim',
        tag: '#sosyal-denge',
        tone: 'auditor',
      },
      {
        id: 'qa_low_motivation',
        label: 'Motivasyonum düşüktü, hafif görev iyi olur',
        tag: '#küçük-adım',
        tone: 'tired',
      },
    ],
  },
  {
    id: 'q_architecture_verify_2',
    contextType: 'task_completed',
    questionText:
      'Bugün verdiğin mühendislik kararını doğrularken en çok ne işine yaradı?',
    quickAnswers: [
      {
        id: 'qa_line_by_line',
        label: 'Veri akışını satır satır takip etmek',
        tag: '#iz-sürme',
        tone: 'auditor',
      },
      {
        id: 'qa_boundary_check',
        label: 'Boş dizi ve hatalı girdi senaryolarını düşünmek',
        tag: '#sınır-testi',
        tone: 'skeptical',
      },
      {
        id: 'qa_wanted_speed',
        label: 'Sadece hızlıca çalışmasını istedim',
        tag: '#pratik',
        tone: 'trusting',
      },
    ],
  },
];

/**
 * Tekrara düşmeme kuralı (`plan.md` Bölüm 4.4):
 * O günkü olaylara göre uygun soruyu seçer; bir önceki gün sorulan soruyu tekrarlamaz.
 */
export function selectJournalQuestionForDay(params: {
  completedTaskCountToday: number;
  triggeredTrapToday: boolean;
  lastQuestionId?: string;
}): JournalQuestionTemplate {
  const { completedTaskCountToday, triggeredTrapToday, lastQuestionId } = params;

  let desiredContext: JournalQuestionTemplate['contextType'] = 'task_completed';
  if (triggeredTrapToday) {
    desiredContext = 'trap_triggered';
  } else if (completedTaskCountToday === 0) {
    desiredContext = 'passive_day';
  }

  const candidates = JOURNAL_QUESTION_POOL.filter(
    q => q.contextType === desiredContext && q.id !== lastQuestionId,
  );

  if (candidates.length > 0) {
    return candidates[0];
  }

  const fallback = JOURNAL_QUESTION_POOL.find(q => q.id !== lastQuestionId);
  return fallback || JOURNAL_QUESTION_POOL[0];
}

/**
 * Gün sonu yanıtını ve gün içi eylemleri değerlendirerek `agent.md` şemasında
 * Personalzy çıktısı üretir. "Bugün paylaşmak istemiyorum" (skippedDetails)
 * seçeneği cezalandırılmaz.
 */
export function evaluateJournalWithPersonalzy(params: {
  gameDay: number;
  completedTaskIdsToday: string[];
  triggeredTrapToday: boolean;
  selectedQuickAnswerId: string | null;
  freeTextNote: string;
  skippedDetails: boolean;
  visitedGymToday: boolean;
}): PersonalzyEvaluationResult {
  const {
    gameDay,
    completedTaskIdsToday,
    triggeredTrapToday,
    selectedQuickAnswerId,
    freeTextNote,
    skippedDetails,
    visitedGymToday,
  } = params;

  // 1. Durum: Oyuncu "Bugün paylaşmak istemiyorum (Minimum değerlendirme ile uyu)" seçti
  if (skippedDetails) {
    return {
      gunluk_ozeti: `${gameDay}. gün minimum değerlendirme ile tamamlandı.`,
      tespit_edilen_durum: 'dinlenme_ve_kisisel_alan_tercihi',
      metrik_degisimleri: {
        sistem_dusuncesi: 0,
        kod_okuryazarligi: 0,
        ai_denetimi: 0,
        hata_ayiklama_sabri: 1,
      },
      ertesi_gun_remediasyon_gorevi: {
        gorev_adi: `${gameDay + 1}. Gün Hedefi: 10 Dakikalık Hafif Kod İncelemesi`,
        hedef_beceri: 'kod_okuryazarligi',
        aciklama:
          'Yorulmadan ısınmak için kısa bir fonksiyonun davranışını gözden geçir.',
        gorevi_veren_npc: 'Asistan Elif',
      },
      oyuncuya_mesaj:
        'Bugün detay paylaşmak istememen tamamen doğal. İyi bir mühendis ne zaman dinlenmesi gerektiğini de bilir. Yarın küçük ve baskısız bir adımla devam edebiliriz.',
    };
  }

  // 2. Durum: Zombie Trap tetiklendiyse yargılamayan öğrenme geri bildirimi
  if (triggeredTrapToday || selectedQuickAnswerId === 'qa_trust_fast') {
    return {
      gunluk_ozeti: `${gameDay}. günde AI çıktısına hızlı güvenildi ve sınır/güvenlik riski deneyimledin.`,
      tespit_edilen_durum: 'ai_kor_guven_egilimi_tespit_edildi',
      metrik_degisimleri: {
        sistem_dusuncesi: 1,
        kod_okuryazarligi: 2,
        ai_denetimi: 1,
        hata_ayiklama_sabri: 2,
      },
      ertesi_gun_remediasyon_gorevi: {
        gorev_adi: `${gameDay + 1}. Gün Hedefi: AI Çıktısını Sorgula & Sınır Testi Yaz`,
        hedef_beceri: 'ai_denetimi',
        aciklama:
          'AI tarafından üretilen kodda boş dizi ve güvenlik açıklarını kabul etmeden önce 2 test senaryosu ile doğrula.',
        gorevi_veren_npc: 'Prof. Demir',
      },
      oyuncuya_mesaj:
        'Hata yapmak veya AI koduna ilk bakışta güvenmek başarısızlık değildir; bunu gün sonunda fark etmiş olman en değerli mühendislik adımı. Yarın kodu teslim etmeden önce küçük bir doğrulama listesi kullanacağız.',
    };
  }

  // 3. Durum: Hiç görev yapılmadıysa (Pasif / Sosyal gün)
  if (completedTaskIdsToday.length === 0) {
    return {
      gunluk_ozeti: `${gameDay}. gün kodlama baskısı olmadan kampüs/dinlenme odaklı geçti.${
        visitedGymToday ? ' Spor salonu aktivitesi enerjiyi dengeledi.' : ''
      }`,
      tespit_edilen_durum: 'enerji_ve_motivasyon_yenileme_gunu',
      metrik_degisimleri: {
        sistem_dusuncesi: 1,
        kod_okuryazarligi: 0,
        ai_denetimi: 0,
        hata_ayiklama_sabri: 2,
      },
      ertesi_gun_remediasyon_gorevi: {
        gorev_adi: `${gameDay + 1}. Gün Hedefi: BMB101 Döngü & Sınır Değer Isınma Görevi`,
        hedef_beceri: 'kod_okuryazarligi',
        aciklama:
          'Dinlenmiş zihinle ZombieOS üzerindeki başlangıç seviyesi kod okuma görevini tamamla.',
        gorevi_veren_npc: 'Prof. Demir',
      },
      oyuncuya_mesaj:
        'Her gün aralıksız kod yazmak zorunda değilsin. Dinlenmek ve yaşam dengesini korumak tükenmişliği önler. Yarın enerjin yüksekken kısa bir görevle başlayabilirsin.',
    };
  }

  // 4. Durum: Görev başarıyla denetlendi ve tamamlandı (Stitch ekranındaki örnek senaryo dahil)
  const noteSuffix = freeTextNote.trim()
    ? ` Notun ("${freeTextNote.trim().slice(0, 50)}") AI belleğine işlendi.`
    : '';

  return {
    gunluk_ozeti: `${gameDay}. günde ${completedTaskIdsToday.length} mühendislik görevi incelendi ve doğrulandı.`,
    tespit_edilen_durum: 'aktif_ai_denetimi_ve_kod_okuma_basarisi',
    metrik_degisimleri: {
      sistem_dusuncesi: 2,
      kod_okuryazarligi: 2,
      ai_denetimi: 1,
      hata_ayiklama_sabri: 2,
    },
    ertesi_gun_remediasyon_gorevi: {
      gorev_adi: `${gameDay + 1}. Gün Hedefi: Güvenli Auth Refactor'ü & Sınır Durumu Testleri`,
      hedef_beceri: 'sistem_dusuncesi',
      aciklama:
        'ZombieOS üzerindeki bir sonraki modülde uç durumları (edge-cases) ve bağımlılık etkilerini denetle.',
      gorevi_veren_npc: 'Prof. Demir',
    },
    oyuncuya_mesaj: `Bugün AI'ın önerdiği koddaki açığı fark etmen harika bir refleksi yansıttı. Acele etmeyip denetlemen seni kıdemsiz bir geliştiriciden ayıran şey.${noteSuffix}`,
  };
}
