/**
 * Faz 7 — Sosyal İlişkiler, Spor Salonu ve NPC Diyalog Adaptasyonu Motoru
 * `plan.md` Bölüm 3.2, 8.3 ve Faz 7 kurallarına birebir uyumludur:
 * - Tanışıklığa (`familiarity`) ve güvene (`trust`) bağlı kademeli diyalog farklılaşması
 * - Oyuncunun tercih ettiği üsluba (`casual` / `formal`) bağlama uygun, saygılı adaptasyon
 * - Tekrarlayan etkileşimlerde diyalog çeşitliliği (`recentTopics` takibi)
 */

import { LocationId } from '../../game/maps/worldMaps';

export type NpcId = 'coach_burak' | 'prof_demir' | 'asistan_elif' | 'kaan_mentor';

export type PlayerCommunicationStyle = 'casual' | 'balanced' | 'formal';

export type RelationshipTier = 'first_time' | 'acquaintance' | 'regular_trusted';

export interface NpcRelationship {
  npcId: NpcId;
  name: string;
  roleTitle: string;
  location: LocationId;
  familiarity: number; // 0..100
  trust: number; // 0..100
  interactionCount: number;
  lastInteractionDay?: number;
  recentDialogueIds: string[];
}

export interface NpcDialogueVariant {
  id: string;
  tier: RelationshipTier;
  style: PlayerCommunicationStyle | 'any';
  greeting: string;
  body: string;
  motivationBonus: number;
  socialBonus: number;
}

const NPC_DIALOGUE_BANK: Record<NpcId, NpcDialogueVariant[]> = {
  coach_burak: [
    // İlk kez gelen oyuncu (first_time: familiarity < 20)
    {
      id: 'burak_first_1',
      tier: 'first_time',
      style: 'any',
      greeting: 'Merhaba, kampüs spor salonuna hoş geldin!',
      body: 'Ben Koç Burak. Yazılım öğrencileri genelde sınav haftası gelene kadar bilgisayar başından kalkmaz. Ağırlıklara geçmeden önce 10 dakika ısınalım.',
      motivationBonus: 8,
      socialBonus: 6,
    },
    {
      id: 'burak_first_2',
      tier: 'first_time',
      style: 'any',
      greeting: 'Selam! İlk antrenman günün mü?',
      body: 'Formunu bozmadan hafif tempoyla başla. Kod yazarken kambur durmaktan omuzların tutulmuştur, esneme hareketlerini atlama.',
      motivationBonus: 8,
      socialBonus: 6,
    },
    // Tanıdık oyuncu (acquaintance: 20 <= familiarity < 60)
    {
      id: 'burak_acq_casual_1',
      tier: 'acquaintance',
      style: 'casual',
      greeting: 'Ooo hoş geldin dostum, bugün enerjin yerinde görünüyor!',
      body: 'Geçen gelişinden beri tempon arttı. Bugün biraz kardiyo ekleyelim, akşam ZombieOS başında kafan berrak olur.',
      motivationBonus: 11,
      socialBonus: 8,
    },
    {
      id: 'burak_acq_formal_1',
      tier: 'acquaintance',
      style: 'formal',
      greeting: 'Tekrar hoş geldin. Antrenman programında 2. aşamaya geçiyoruz.',
      body: 'Düzenli gelmeye başlaman odaklanma süreni de artıracaktır. Bugün core ve sırt egzersizlerine odaklanalım.',
      motivationBonus: 11,
      socialBonus: 8,
    },
    // Düzenli / Yakın oyuncu (regular_trusted: familiarity >= 60)
    {
      id: 'burak_reg_casual_1',
      tier: 'regular_trusted',
      style: 'casual',
      greeting: 'Vay benim şampiyon yazılımcım gelmiş! Nasılsın kardeşim?',
      body: 'Disiplinin harika! Hem dersleri hem sporu bu kadar dengeli götüren az öğrenci gördüm. Bugün seninle özel istasyon serisini yapıyoruz.',
      motivationBonus: 15,
      socialBonus: 10,
    },
    {
      id: 'burak_reg_formal_1',
      tier: 'regular_trusted',
      style: 'formal',
      greeting: 'Seni görmek çok güzel! Salonun en istikrarlı üyelerinden biri oldun.',
      body: 'İstikrarın gerçekten örnek düzeyde. Zihinsel yorgunluğunu dengelemek için bugün ileri seviye dayanıklılık programını uygulayabiliriz.',
      motivationBonus: 15,
      socialBonus: 10,
    },
    {
      id: 'burak_reg_any_2',
      tier: 'regular_trusted',
      style: 'any',
      greeting: 'Hoş geldin! Tam da senin antrenman saatin gelmişti.',
      body: 'Artık salonun müdavimisin. Bugün antrenmandan sonra takım arkadaşlarınla kısa bir strateji sohbeti de yapabilirsin.',
      motivationBonus: 14,
      socialBonus: 10,
    },
  ],
  prof_demir: [
    {
      id: 'demir_first_1',
      tier: 'first_time',
      style: 'any',
      greeting: 'Merhaba. BMB201 dersine hoş geldin.',
      body: 'Bu derste yalnızca çalışan kod getirmek yetmez; kodun neden öyle çalıştığını ve AI çıktısındaki riskleri açıklamanı beklerim.',
      motivationBonus: 5,
      socialBonus: 4,
    },
    {
      id: 'demir_acq_1',
      tier: 'acquaintance',
      style: 'any',
      greeting: 'Tekrar merhaba. Son laboratuvar incelemendeki notlarını gördüm.',
      body: 'Kodu satır satır sorgulama alışkanlığın gelişiyor. Bir sonraki Zombie Projesinde sınır durumlarına özellikle dikkat et.',
      motivationBonus: 8,
      socialBonus: 6,
    },
    {
      id: 'demir_reg_casual_1',
      tier: 'regular_trusted',
      style: 'casual',
      greeting: 'Hoş geldin genç meslektaşım! Bugün hangi mimari problemi masaya yatırıyoruz?',
      body: 'AI çıktılarını denetleme disiplinin çok iyi noktaya geldi. Dönem sonunda araştırma grubumdaki ileri seviye sistem tasarım görevlerine katılabilirsin.',
      motivationBonus: 12,
      socialBonus: 9,
    },
    {
      id: 'demir_reg_formal_1',
      tier: 'regular_trusted',
      style: 'formal',
      greeting: 'Hoş geldin. Mühendislik yaklaşımındaki istikrarı takdir ediyorum.',
      body: 'Karmaşık sistemlerde yan etkileri öngörme becerin belirgin biçimde ilerledi. Yeni mimari vaka analizini ZombieOS üzerinden seninle paylaştım.',
      motivationBonus: 12,
      socialBonus: 9,
    },
  ],
  asistan_elif: [
    {
      id: 'elif_first_1',
      tier: 'first_time',
      style: 'any',
      greeting: 'Selam! Lab saatine hoş geldin, ben Asistan Elif.',
      body: 'Ödevlerde takıldığın yer olursa veya AI garip bir kod üretirse birlikte test senaryosu yazabiliriz.',
      motivationBonus: 6,
      socialBonus: 5,
    },
    {
      id: 'elif_acq_1',
      tier: 'acquaintance',
      style: 'any',
      greeting: 'Selam! `design.md` dosyanı güncellediğini gördüm.',
      body: 'Tercihlerini ve açık soruları böyle net tutman AI ile çalışırken işini çok kolaylaştıracak.',
      motivationBonus: 9,
      socialBonus: 7,
    },
    {
      id: 'elif_reg_1',
      tier: 'regular_trusted',
      style: 'any',
      greeting: 'Selam ekip arkadaşı! Yine harika bir edge-case yakalamışsın!',
      body: 'Boş dizi ve SQL parametresi kontrollerin sayesinde labdaki örnek projeyi kurtardık. Yeni indie oyun görevini mutlaka dene!',
      motivationBonus: 12,
      socialBonus: 9,
    },
  ],
  kaan_mentor: [
    {
      id: 'kaan_first_1',
      tier: 'first_time',
      style: 'any',
      greeting: 'Selam, ben üst sınıflardan Kaan. Zombie projelere bakıyorsun galiba?',
      body: 'Eski bir kod tabanı gördüğünde ilk tepkin her şeyi silip baştan yazmak olmasın. Önce sistemin neyi çözdüğünü anla.',
      motivationBonus: 6,
      socialBonus: 5,
    },
    {
      id: 'kaan_acq_1',
      tier: 'acquaintance',
      style: 'any',
      greeting: 'Hey! Legacy Auth modülündeki incelemen bayağı temizdi.',
      body: 'Eski kodu kırmadan güvenlik açığını kapatmak gerçek mühendisliktir. Böyle devam et.',
      motivationBonus: 9,
      socialBonus: 7,
    },
    {
      id: 'kaan_reg_1',
      tier: 'regular_trusted',
      style: 'any',
      greeting: 'İşte kampüsün en sağlam Zombie Kod Avcısı! Nasılsın?',
      body: 'Artık 3. ve 4. sınıf seviyesindeki dağıtık sistem ve mikroservis krizlerine hazırsın.',
      motivationBonus: 13,
      socialBonus: 10,
    },
  ],
};

export function createInitialNpcRelationships(): Record<NpcId, NpcRelationship> {
  return {
    coach_burak: {
      npcId: 'coach_burak',
      name: 'Koç Burak',
      roleTitle: 'Kampüs Spor Eğitmeni',
      location: 'gym',
      familiarity: 10,
      trust: 15,
      interactionCount: 0,
      recentDialogueIds: [],
    },
    prof_demir: {
      npcId: 'prof_demir',
      name: 'Prof. Demir',
      roleTitle: 'Yazılım Mimarisi & Algoritma Hocası',
      location: 'university',
      familiarity: 15,
      trust: 20,
      interactionCount: 0,
      recentDialogueIds: [],
    },
    asistan_elif: {
      npcId: 'asistan_elif',
      name: 'Asistan Elif',
      roleTitle: 'Yazılım Lab & Test Asistanı',
      location: 'university',
      familiarity: 20,
      trust: 25,
      interactionCount: 0,
      recentDialogueIds: [],
    },
    kaan_mentor: {
      npcId: 'kaan_mentor',
      name: 'Kaan (Üst Sınıf Mentor)',
      roleTitle: 'Zombie Kod & Legacy Sistem Mentoru',
      location: 'dorm',
      familiarity: 15,
      trust: 20,
      interactionCount: 0,
      recentDialogueIds: [],
    },
  };
}

export function getRelationshipTier(familiarity: number): RelationshipTier {
  if (familiarity < 20) {
    return 'first_time';
  }
  if (familiarity < 60) {
    return 'acquaintance';
  }
  return 'regular_trusted';
}

/**
 * Oyuncunun ilgili NPC ile tanışıklık düzeyine (`first_time`, `acquaintance`, `regular_trusted`),
 * tercih ettiği iletişim üslubuna (`casual`, `balanced`, `formal`) ve son konuşulan
 * diyalog geçmişine göre tekrara düşmeyen tutarlı bir yanıt üretir.
 */
export function interactWithNpc(params: {
  relationship: NpcRelationship;
  playerStyle: PlayerCommunicationStyle;
  gameDay: number;
}): {
  updatedRelationship: NpcRelationship;
  dialogue: NpcDialogueVariant;
  tierBefore: RelationshipTier;
  tierAfter: RelationshipTier;
} {
  const { relationship, playerStyle, gameDay } = params;
  const tierBefore = getRelationshipTier(relationship.familiarity);
  const pool = NPC_DIALOGUE_BANK[relationship.npcId] || [];

  const desiredStyle = playerStyle === 'balanced' ? 'any' : playerStyle;

  // 1. Mevcut tanışıklık kademesine ve üsluba uygun, son konuşmada kullanılmamış adaylar
  let candidates = pool.filter(
    d =>
      d.tier === tierBefore &&
      (d.style === desiredStyle || d.style === 'any') &&
      !relationship.recentDialogueIds.includes(d.id),
  );

  // 2. Eğer üsluba özel aday kalmadıysa aynı kademedeki herhangi bir kullanılmamış aday
  if (candidates.length === 0) {
    candidates = pool.filter(
      d =>
        d.tier === tierBefore &&
        !relationship.recentDialogueIds.includes(d.id),
    );
  }

  // 3. Yine de boşsa aynı kademedeki tüm adaylar
  if (candidates.length === 0) {
    candidates = pool.filter(d => d.tier === tierBefore);
  }

  const chosen = candidates[0] || pool[0];

  const nextFamiliarity = Math.min(100, relationship.familiarity + 18);
  const nextTrust = Math.min(100, relationship.trust + 12);
  const tierAfter = getRelationshipTier(nextFamiliarity);

  const updatedRelationship: NpcRelationship = {
    ...relationship,
    familiarity: nextFamiliarity,
    trust: nextTrust,
    interactionCount: relationship.interactionCount + 1,
    lastInteractionDay: gameDay,
    recentDialogueIds: [
      chosen.id,
      ...relationship.recentDialogueIds.slice(0, 3),
    ],
  };

  return {
    updatedRelationship,
    dialogue: chosen,
    tierBefore,
    tierAfter,
  };
}
