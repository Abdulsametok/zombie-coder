/**
 * Zombie Coder — Güncellenmiş Müfredat & Strateji Vaka Havuzu
 * Kodlama sözdizimi soruları kaldırıldı; yerine:
 * 1) Algoritma, Yazılımın Temelleri, Veri Yapıları ve Sistem Mimarileri (Prof. Demir - Üniversite)
 * 2) Ürün Planlama, MVP Yol Haritası ve Pazarlama Stratejisi (Kaan - Üniversite)
 * 3) Satış Stratejisi, Müşteri İknası ve Gelir Modeli (Koç Burak - Spor Salonu)
 * Seçeneklerde kopya veren "HIZLI / RİSKLİ", "EN İYİ ÇÖZÜM", "DENGELİ" etiketleri yerine
 * tarafsız strateji etiketleri ("STRATEJİ A", "STRATEJİ B", "STRATEJİ C") kullanılır.
 */

export type WorkspaceFolderId =
  | 'university'
  | 'my_projects'
  | 'zombie_projects'
  | 'ai_memory';

export type TaskDifficulty = 'KOLAY (LOW)' | 'ORTA (MID)' | 'ZOR (HIGH)';

export type EngineeringMetricKey =
  | 'sistem_dusuncesi'
  | 'kod_okuryazarligi'
  | 'ai_denetimi'
  | 'hata_ayiklama_sabri';

export interface CodeLineItem {
  lineNumber: string;
  content: string;
  isComment?: boolean;
  isBugHighlight?: boolean;
  bugBadgeText?: string;
}

export interface TaskDecisionOption {
  id: string;
  title: string;
  badgeText: string;
  badgeTone: 'danger' | 'balanced' | 'optimal';
  description: string;
  impactSummary: string[];
  timeCostMinutes: number;
  energyCost: number;
  motivationDelta: number;
  metricDeltas: Partial<Record<EngineeringMetricKey, number>>;
  isTrapFall?: boolean;
  feedbackTitle: string;
  feedbackMessage: string;
  designMdRuleToAdd?: string;
}

export interface EngineeringTask {
  id: string;
  curriculumCode: string;
  folder: WorkspaceFolderId;
  missionTag: string;
  title: string;
  moduleSubtitle: string;
  npcSender: string;
  courseLabel: string;
  npcQuote: string;
  difficulty: TaskDifficulty;
  difficultyLevel: 1 | 2 | 3;
  estimatedMinutes: number;
  fileName: string;
  languageTag: string;
  acceptanceCriteria: Array<{
    id: string;
    label: string;
    initialPassed: boolean;
  }>;
  codeLines: CodeLineItem[];
  warningTitle: string;
  warningBody: string;
  decisions: TaskDecisionOption[];
}

export const INITIAL_ENGINEERING_TASKS: EngineeringTask[] = [
  {
    id: 'task_legacy_login_audit',
    curriculumCode: 'G8.1 // SİSTEM MİMARİSİ & GÜVENLİK',
    folder: 'zombie_projects',
    missionTag: '[VAKA // ZERO_TRUST_MİMARİ]',
    title: 'Kimlik Doğrulama ve Sıfır Güven (Zero-Trust) Mimarisi',
    moduleSubtitle: 'Modül: Sistem Mimarisi • Katmanlı Doğrulama & Yetkilendirme',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB201 Dersi • Mimari Vaka Analizi #1',
    npcQuote:
      '“İyi bir mimar kod satırından önce sistemin giriş kapısını, doğrulama katmanını ve veri sınırlarını tasarlar!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 15,
    fileName: 'mimari_gecit_semasi.md',
    languageTag: 'MİMARİ ŞEMA',
    acceptanceCriteria: [
      {
        id: 'ac_empty_pwd',
        label: 'İstemci isteklerini API Gateway sınırında filtrele',
        initialPassed: true,
      },
      {
        id: 'ac_sql_injection',
        label: 'Veritabanı erişimini doğrudan metin birleştirmeden izole et',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// MEVCUT SİSTEM AKIŞ DİYAGRAMI (Prof. Demir Ders Notu)',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: '[Mobil İstemci] ---> [API Giriş Katmanı]',
      },
      {
        lineNumber: '03',
        content: '   │  Adım 1: E-posta ve şifre alanlarının doluluk kontrolü',
      },
      {
        lineNumber: '04',
        content:
          '   ▼  Adım 2: İstemci verisinin doğrudan ham sorguyla veritabanına iletilmesi',
        isBugHighlight: true,
        bugBadgeText: 'MİMARİ ZAFIYET',
      },
      {
        lineNumber: '05',
        content: '[Veritabanı Katmanı] ---> [Oturum Jetonu (Token) Üretimi]',
      },
      {
        lineNumber: '06',
        content: '// Soru: Bu mimari akışı nasıl yeniden yapılandırmalıyız?',
        isComment: true,
      },
    ],
    warningTitle: 'MİMARİ KATMAN ANALİZİ',
    warningBody:
      'Sistemde kullanıcıdan gelen dış veri, hiçbir şema doğrulaması ve parametre ayrıştırması yapılmadan doğrudan veri katmanına ulaşıyor.',
    decisions: [
      {
        id: 'accept_as_is',
        title: '1) Mevcut Doğrudan Erişim Akışını Koru ve Yayına Al',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Ekstra doğrulama katmanı eklemeden hız kazanmak için mevcut mimariyle devam et.',
        impactSummary: ['Gecikmesiz Teslim', 'Katmansız Akış', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -5,
        metricDeltas: {
          ai_denetimi: -4,
          kod_okuryazarligi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Mimari Sınır İhlali Yaşandı (Öğrenme Fırsatı)',
        feedbackMessage:
          'Doğrulama katmanı olmadığı için bozuk istekler doğrudan veritabanını etkiledi. Yarın için katmanlı doğrulama mimarisi çalışma planına eklendi.',
        designMdRuleToAdd:
          'Sistem mimarisinde dış girdiler daima API Gateway ve şema doğrulama katmanından geçerek veri katmanına iletilir.',
      },
      {
        id: 'write_tests',
        title: '2) Giriş Katmanına Sınır Değer Senaryoları ve İzleme Ekle',
        badgeText: 'STRATEJİ B',
        badgeTone: 'balanced',
        description:
          'Beklenmeyen kullanıcı girdilerini yakalamak için uç durum (edge-case) doğrulama kuralları tanımla.',
        impactSummary: ['Girdi Doğrulama', 'Sınır Kontrolü', '10 dk'],
        timeCostMinutes: 10,
        energyCost: 10,
        motivationDelta: 4,
        metricDeltas: {
          hata_ayiklama_sabri: 4,
          sistem_dusuncesi: 3,
        },
        feedbackTitle: 'Sınır Doğrulama Katmanı Kuruldu',
        feedbackMessage:
          '+4 Hata Ayıklama Sabrı ve +3 Sistem Düşüncesi kazanıldı. Anormal istekler sistem sınırında tespit edildi.',
        designMdRuleToAdd:
          'Kimlik doğrulama akışlarında sınır durum (edge-case) senaryoları her sürüm öncesi doğrulanır.',
      },
      {
        id: 'refactor_query',
        title: '3) Katmanlı Mimari (Gateway + Parametreli Veri Soyutlama) Kur',
        badgeText: 'STRATEJİ C',
        badgeTone: 'optimal',
        description:
          'İstemci verisini şema doğrulayıcıdan geçir ve veri katmanında yalnızca parametreli soyutlama kullan.',
        impactSummary: ['Sıfır Güven Mimarisi', 'Tam İzolasyon', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 12,
        motivationDelta: 8,
        metricDeltas: {
          ai_denetimi: 6,
          kod_okuryazarligi: 4,
          sistem_dusuncesi: 2,
        },
        feedbackTitle: 'Sağlam Sistem Mimarisi Kararı!',
        feedbackMessage:
          '+6 AI Denetimi ve +4 Yazılım Temelleri kazanıldı. Katmanlı doğrulama mimarisi başarıyla devreye alındı.',
        designMdRuleToAdd:
          'Veri erişim katmanı dış dünyadan tamamen izole edilir ve yalnızca parametreli veri modelleriyle çalışır.',
      },
    ],
  },
  {
    id: 'task_g1_1_loop_syntax',
    curriculumCode: 'G1.1 // ALGORİTMA & AKIŞ TASARIMI',
    folder: 'university',
    missionTag: '[DERS // ALGORİTMA_TEMELLERİ]',
    title: 'G1.1: Algoritmik Karar Ağacı ve Sınır Değer Mantığı',
    moduleSubtitle: 'Modül: Yazılımın Temelleri • Algoritma Tasarımı (Prof. Demir)',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB101 • Algoritma ve Yazılım Temelleri',
    npcQuote:
      '“Algoritma, bilgisayarın değil insanın problemi adım adım nasıl çözdüğünün haritasıdır!”',
    difficulty: 'KOLAY (LOW)',
    difficultyLevel: 1,
    estimatedMinutes: 10,
    fileName: 'algoritma_akisi.md',
    languageTag: 'AKIŞ ŞEMASI',
    acceptanceCriteria: [
      {
        id: 'ac_readable_loop',
        label: 'Anlaşılır ve izlenebilir adım adım algoritma akışı kur',
        initialPassed: true,
      },
      {
        id: 'ac_explain_logic',
        label: 'Eşik değer (50 puan) ve boş veri durumunu algoritmada tanımla',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// ALGORİTMA AKIŞ TASARIMI: Öğrenci Başarı Hesaplama',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'ADIM 1: Öğrenci not listesini al',
      },
      {
        lineNumber: '03',
        content:
          'ADIM 2: Karmaşık tek adımlı sıkıştırılmış formülle ortalamayı > 50 karşılaştır',
        isBugHighlight: true,
        bugBadgeText: 'SINIR & ŞEFFAFLIK SORUNU',
      },
      {
        lineNumber: '04',
        content:
          '// Not: Tam 50 puan alan öğrenciler eleniyor ve adımlar izlenemiyor.',
        isComment: true,
      },
    ],
    warningTitle: 'ALGORİTMİK AKIŞ VE EŞİK DEĞER SORUSU',
    warningBody:
      'Taslak algoritmada hem tam 50 puan sınır değeri yanlış modellenmiş hem de tüm hesaplama tek bir kara kutu adıma sıkıştırıldığı için denetlenemiyor.',
    decisions: [
      {
        id: 'copy_paste_ai',
        title: '1) Tek Adımlı Kara Kutu Algoritmayı Olduğu Gibi Kullan',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Adımları ayrıştırmadan hızlıca tek satırlık mantıkla süreci tamamla.',
        impactSummary: ['Kısa Akış', 'Düşük İzlenebilirlik', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 4,
        motivationDelta: -4,
        metricDeltas: {
          kod_okuryazarligi: -3,
          ai_denetimi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Algoritma Sınır Değerde Yanlış Sonuç Üretti',
        feedbackMessage:
          'Prof. Demir tam 50 puan alan öğrencilerin neden kaldığını ve ara adımların nasıl çalıştığını sorduğunda kara kutu model yetersiz kaldı.',
      },
      {
        id: 'rewrite_readable',
        title: '2) Açık Karar Ağacı Kur ve Eşik Koşulunu (50 ve Üzeri) Netleştir',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'Boş liste kontrolü, toplam adımı, ortalama hesabı ve >= 50 karar düğümünü açıkça modelle.',
        impactSummary: ['Şeffaf Algoritma', 'Doğru Sınır Koşulu', '10 dk'],
        timeCostMinutes: 10,
        energyCost: 8,
        motivationDelta: 7,
        metricDeltas: {
          kod_okuryazarligi: 5,
          ai_denetimi: 4,
        },
        feedbackTitle: 'Kusursuz Algoritma Tasarımı!',
        feedbackMessage:
          '+5 Yazılım Temelleri ve +4 Analiz yetkinliği kazanıldı. Algoritmanın her adımı şeffaf ve sınır değerlere dayanıklı hale geldi.',
        designMdRuleToAdd:
          'Algoritma tasarımlarında anlaşılabilir karar adımları ve sınır değer (edge-case) düğümleri her zaman açıkça modellenir.',
      },
      {
        id: 'fix_only_operator',
        title: '3) Yalnızca 50 Puan Eşik Koşulunu Güncelle',
        badgeText: 'STRATEJİ C',
        badgeTone: 'balanced',
        description:
          'Algoritma adımlarını bölmeden sadece sınır değer şartını düzelt.',
        impactSummary: ['Hızlı Düzeltme', 'Kısmi İyileştirme', '7 dk'],
        timeCostMinutes: 7,
        energyCost: 6,
        motivationDelta: 3,
        metricDeltas: {
          hata_ayiklama_sabri: 2,
          kod_okuryazarligi: 1,
        },
        feedbackTitle: 'Sınır Koşulu Güncellendi',
        feedbackMessage:
          '50 puan sorunu çözüldü ancak algoritmanın okunabilirliği için ileride adım ayrıştırması gerekecek.',
      },
    ],
  },
  {
    id: 'task_g1_2_edge_case_rogue',
    curriculumCode: 'G1.2 // ÜRÜN PLANLAMA & PAZARLAMA',
    folder: 'my_projects',
    missionTag: '[PLANLAMA // MVP_VE_PAZARLAMA]',
    title: 'G1.2: Ürün Planlama, MVP Kapsamı ve İlk Kullanıcı Stratejisi',
    moduleSubtitle: 'Modül: Proje Planlama & Pazarlama • Kaan ile Ürün Atölyesi',
    npcSender: 'Kaan (Planlama Mentoru)',
    courseLabel: 'Üniversite Planlama Masası • Ürün Stratejisi',
    npcQuote:
      '“Kimsenin kullanmayacağı 20 özelliği 6 ayda yapacağına, en kritik sorunu çözen MVP’yi 2 haftada çıkarıp pazarı test et!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 15,
    fileName: 'urun_yol_haritasi.md',
    languageTag: 'ÜRÜN PLANI',
    acceptanceCriteria: [
      {
        id: 'ac_empty_inv',
        label: 'İlk kullanıcı (Onboarding) deneyimini ve MVP kapsamını netleştir',
        initialPassed: false,
      },
      {
        id: 'ac_negative_durability',
        label: 'Hedef kitle ve pazara giriş (Go-To-Market) kanalını belirle',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// KAAN İLE ÜRÜN PLANLAMA & PAZARLAMA TABLOSU',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'HEDEF ÜRÜN: Kampüs Öğrenci Verimlilik & Oyunlaştırılmış Planlayıcı',
      },
      {
        lineNumber: '03',
        content:
          'MEVCUT PLAN: 18 farklı modülü aynı anda geliştirip 6 ay sonra ilk kez kullanıcıya açmak',
        isBugHighlight: true,
        bugBadgeText: 'ÖZELLİK ŞİŞMESİ RİSKİ',
      },
      {
        lineNumber: '04',
        content: 'PAZARLAMA DURUMU: İlk gün yeni gelen kullanıcı için boş ekran deneyimi belirsiz',
      },
      {
        lineNumber: '05',
        content: '// Kaan: "Sence bu ürünün yol haritasını ve lansmanını nasıl kurmalıyız?"',
        isComment: true,
      },
    ],
    warningTitle: 'ÜRÜN PLANLAMA VE PAZARA ÇIKIŞ KARARI',
    warningBody:
      'Çok fazla özelliği aynı anda planlamak lansmanı geciktiriyor ve yeni kayıt olan ilk kullanıcıların ürünü nasıl deneyimleyeceği (Onboarding) planlanmamış.',
    decisions: [
      {
        id: 'ignore_empty_array',
        title: '1) Tüm 18 Özelliği Bitirene Kadar Kullanıcı Testini Ertele',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Erken geri bildirim almadan ürünü kapalı kapılar ardında geliştirmeye devam et.',
        impactSummary: ['Geniş Kapsam', 'Geç Pazar Testi', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -3,
        metricDeltas: {
          sistem_dusuncesi: -3,
          hata_ayiklama_sabri: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Pazar Geri Bildirimi Gecikti',
        feedbackMessage:
          'Aylar süren geliştirme sonunda kullanıcıların aslında sadece 2 temel özelliğe ihtiyaç duyduğu ortaya çıktı.',
      },
      {
        id: 'guard_clause_and_test',
        title: '2) Çekirdek MVP Kapsamı + Onboarding Akışı + Kampüs Pilot Pazarlaması Kur',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'MoSCoW yöntemiyle en kritik 3 özelliği seç, ilk kullanıcı rehberini kur ve 50 öğrenciyle pilot test başlat.',
        impactSummary: ['Odaklı MVP', 'Hızlı Pazar Doğrulaması', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 10,
        motivationDelta: 9,
        metricDeltas: {
          sistem_dusuncesi: 5,
          hata_ayiklama_sabri: 5,
          ai_denetimi: 3,
        },
        feedbackTitle: 'Harika Ürün Planlama ve Pazarlama Stratejisi!',
        feedbackMessage:
          '+5 Sistem Düşüncesi kazanıldı. Kaan ile kurduğun MVP planı sayesinde ilk haftadan gerçek kullanıcı talebi toplandı!',
        designMdRuleToAdd:
          'Ürün planlamasında önce çekirdek değer üreten MVP kapsamı ve ilk kullanıcı (onboarding) deneyimi doğrulanır.',
      },
      {
        id: 'optional_chaining_only',
        title: '3) Özellik Sayısını Azalt Ama Pazarlama Testini Sonraya Bırak',
        badgeText: 'STRATEJİ C',
        badgeTone: 'balanced',
        description:
          'Geliştirme kapsamını daralt ancak kullanıcı görüşmelerini lansman sonrasına ertele.',
        impactSummary: ['Orta Kapsam', 'Ertelenmiş Pazarlama', '8 dk'],
        timeCostMinutes: 8,
        energyCost: 7,
        motivationDelta: 4,
        metricDeltas: {
          kod_okuryazarligi: 2,
          hata_ayiklama_sabri: 2,
        },
        feedbackTitle: 'Kapsam Daraltıldı',
        feedbackMessage:
          'Geliştirme süresi kısaldı; bir sonraki adımda Kaan ile hedef kitle pazarlama kanallarını netleştirebilirsin.',
      },
    ],
  },
  {
    id: 'task_g2_1_encapsulation',
    curriculumCode: 'G2.1 // YAZILIMIN TEMELLERİ & MODÜLER MİMARİ',
    folder: 'university',
    missionTag: '[DERS // MODÜLER_TASARIM]',
    title: 'G2.1: Yazılımın Temelleri — Veri Gizliliği ve Sorumluluk Ayrımı',
    moduleSubtitle: 'Modül: Mimari Temeller • Kapsülleme ve Sınır Koruma (Prof. Demir)',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB102 • Yazılım Temelleri ve Tasarım',
    npcQuote:
      '“Bir sistemde her modül diğerinin iç verisini doğrudan değiştirebiliyorsa, o sistem ilk büyümede çöker!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 12,
    fileName: 'moduler_cuzdan_mimarisi.md',
    languageTag: 'SİSTEM MODELİ',
    acceptanceCriteria: [
      {
        id: 'ac_private_balance',
        label: 'Cüzdan bakiye durumunu dış modüllerin doğrudan müdahalesine kapat',
        initialPassed: false,
      },
      {
        id: 'ac_withdraw_validation',
        label: 'Harcama işlemlerini iş kurallarıyla doğrulayan tek bir kapı tanımla',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// KAMPÜS CÜZDAN SİSTEMİ BİLEŞEN ŞEMASI',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: '[Kantin Modülü] ──┐',
      },
      {
        lineNumber: '03',
        content:
          '[Kütüphane Modülü]┼──► [Açık Bakiye Verisi] (Doğrudan Değiştirilebilir!)',
        isBugHighlight: true,
        bugBadgeText: 'SINIR İHLALİ',
      },
      {
        lineNumber: '04',
        content: '[Yemekhane Modülü]┘',
      },
      {
        lineNumber: '05',
        content: '// Problem: Dış modüller kuralları atlayıp bakiyeyi eksiye düşürebiliyor.',
        isComment: true,
      },
    ],
    warningTitle: 'MODÜL SINIRLARI VE VERİ BÜTÜNLÜĞÜ',
    warningBody:
      'Kampüs cüzdan sisteminde bakiye verisi tüm dış modüllere açık bırakılmış. Herhangi bir modül doğrulama kurallarını atlayarak bakiyeyi bozabiliyor.',
    decisions: [
      {
        id: 'keep_public_fast',
        title: '1) Tüm Modüllerin Doğrudan Veri Erişimini Serbest Bırak',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Modüller arası entegrasyonu hızlandırmak için veri sınırlarını açık tut.',
        impactSummary: ['Hızlı Entegrasyon', 'Yüksek Bağımlılık', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -4,
        metricDeltas: {
          sistem_dusuncesi: -3,
          kod_okuryazarligi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Veri Bütünlüğü Bozuldu',
        feedbackMessage:
          'Farklı modüller aynı anda bakiyeyi doğrudan değiştirdiği için tutarsız kayıtlar oluştu.',
      },
      {
        id: 'encapsulate_private_getter',
        title: '2) Kapsülleme (Encapsulation) ve Doğrulamalı Servis Arayüzü Kur',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'İç durumu tamamen gizle; dış modüllerin yalnızca bakiye kontrolü yapan yetkili arayüz üzerinden işlem yapmasını sağla.',
        impactSummary: ['Modüler İzolasyon', 'Tam Veri Güvenliği', '12 dk'],
        timeCostMinutes: 12,
        energyCost: 9,
        motivationDelta: 8,
        metricDeltas: {
          sistem_dusuncesi: 5,
          kod_okuryazarligi: 4,
          ai_denetimi: 3,
        },
        feedbackTitle: 'Modüler Mimari Başarıyla Kuruldu!',
        feedbackMessage:
          'Cüzdan modülü dış müdahalelere kapatıldı ve yalnızca kurallı arayüz üzerinden güvenli çalışıyor.',
        designMdRuleToAdd:
          'Sistem bileşenlerinde iç durum (state) dışarıya kapatılır; modüller arası iletişim yalnızca doğrulanmış arayüzlerle yapılır.',
      },
    ],
  },
  {
    id: 'task_g3_2_complexity_timeout',
    curriculumCode: 'G3.2 // VERİ YAPILARI & ALGORİTMA KARMAŞIKLIĞI',
    folder: 'university',
    missionTag: '[DERS // VERİ_YAPILARI]',
    title: 'G3.2: Veri Yapıları Seçimi — 100.000 Kayıtta Hızlı Arama Mimarisi',
    moduleSubtitle: 'Modül: Veri Yapıları • Hash Tablosu, Ağaçlar ve Karmaşıklık (Prof. Demir)',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB203 • Veri Yapıları ve Algoritmalar',
    npcQuote:
      '“10 kayıtta her yöntem çalışır; gerçek mühendislik 100.000 kayıtta doğru veri yapısını seçtiğinde başlar!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'veri_yapisi_secimi.md',
    languageTag: 'VERİ YAPISI',
    acceptanceCriteria: [
      {
        id: 'ac_sub_quadratic',
        label: 'O(N²) tekrarlı tarama yerine O(1) / O(N) veri yapısı seç',
        initialPassed: false,
      },
      {
        id: 'ac_preserve_order',
        label: '100.000 öğrenci kaydını milisaniyeler içinde eşleştir',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// VERİ YAPISI KARŞILAŞTIRMA SENARYOSU (100.000 Öğrenci Kaydı)',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'Mevcut Yöntem: Sırasız Liste üzerinde her öğrenci için tüm listeyi baştan sona taramak',
      },
      {
        lineNumber: '03',
        content:
          'İşlem Maliyeti: 100.000 x 100.000 = ~5 Milyar Karşılaştırma (Sistem Donması!)',
        isBugHighlight: true,
        bugBadgeText: 'O(N²) DARBOĞAZI',
      },
      {
        lineNumber: '04',
        content: 'Alternatif Veri Yapıları: Hash Tablosu (Set/Map) veya Dengeli Arama Ağacı (BST)',
      },
      {
        lineNumber: '05',
        content: '// Prof. Demir: "Bu ölçekte hangi veri yapısını seçersin?"',
        isComment: true,
      },
    ],
    warningTitle: 'VERİ YAPISI VE ÖLÇEKLENEBİLİRLİK KARARI',
    warningBody:
      '100.000 öğrencinin ders kaydı çakışmalarını kontrol ederken sırasız liste üzerinde iç içe tarama yapmak sunucuyu kilitliyor.',
    decisions: [
      {
        id: 'ship_nested_loop',
        title: '1) Sırasız Liste Üzerinde Doğrusal Taramaya Devam Et',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Ek bellek kullanmamak için mevcut iç içe tarama yapısını koru.',
        impactSummary: ['Düşük Bellek', 'Yüksek Zaman Maliyeti', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -5,
        metricDeltas: {
          sistem_dusuncesi: -4,
          ai_denetimi: -3,
        },
        isTrapFall: true,
        feedbackTitle: 'Yüksek Trafikte Zaman Aşımı (Timeout)!',
        feedbackMessage:
          '100.000 kayıtta doğrusal tarama sunucuyu kilitledi. Ölçeklenebilir sistemler için Hash Tablosu veya indeksli ağaç yapısı şarttır.',
      },
      {
        id: 'use_hash_set_on',
        title: '2) Hash Tablosu (Hash Set / Map) Veri Yapısıyla O(N) Akışa Geç',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'Anahtar bazlı O(1) erişim sağlayan Hash veri yapısı kullanarak tüm kontrolü tek geçişte tamamla.',
        impactSummary: ['O(1) Arama Erişimi', 'Milisaniye Yanıt Süresi', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 11,
        motivationDelta: 9,
        metricDeltas: {
          sistem_dusuncesi: 6,
          ai_denetimi: 5,
          kod_okuryazarligi: 3,
        },
        feedbackTitle: 'Mükemmel Veri Yapısı Seçimi!',
        feedbackMessage:
          'Hash Tablosu mimarisiyle 5 milyar işlem 100.000 işleme indirildi; yanıt süresi 14 milisaniyeye düştü!',
        designMdRuleToAdd:
          'Büyük veri kümelerinde tekillik ve eşleştirme işlemleri için O(N²) tarama yerine Hash Tablosu (Map/Set) veya İndeksli Ağaç yapıları kullanılır.',
      },
    ],
  },
  {
    id: 'task_g5_1_zombie_rewrite_trap',
    curriculumCode: 'G5.1 // PLANLAMA & YOL HARİTASI STRATEJİSİ',
    folder: 'zombie_projects',
    missionTag: '[PLANLAMA // ÜRÜN_DÖNÜŞÜMÜ]',
    title: 'G5.1: Agile Sprint Planlama ve Miras Ürün Dönüşüm Stratejisi',
    moduleSubtitle: 'Modül: Stratejik Planlama • Kaan ile Yol Haritası Yönetimi',
    npcSender: 'Kaan (Planlama Mentoru)',
    courseLabel: 'Üniversite Proje Ofisi • Ürün Dönüşüm Vaka Analizi',
    npcQuote:
      '“Canlıda binlerce kullanıcısı olan bir ürünü bir gecede silip baştan yapmaya kalkarsan hem müşteriyi hem iş kurallarını kaybedersin!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'sprint_donusum_plani.md',
    languageTag: 'YOL HARİTASI',
    acceptanceCriteria: [
      {
        id: 'ac_keep_orphan_rule',
        label: 'Mevcut kullanıcıların özel burs ve hak kurallarını koru',
        initialPassed: false,
      },
      {
        id: 'ac_modular_guard',
        label: 'Aşamalı (Sprint bazlı) geçiş yol haritası oluştur',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// ÜRÜN DÖNÜŞÜM & SPRINT PLANLAMA SENARYOSU',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'Durum: 5 yıldır çalışan burs ve abonelik sistemi karmaşıklaştı.',
      },
      {
        lineNumber: '03',
        content:
          'Radikal Öneri: "Mevcut sistemi tamamen kapatıp sıfırdan tek kurallı yeni sistem açalım"',
        isBugHighlight: true,
        bugBadgeText: 'MÜŞTERİ & KURAL KAYBI RİSKİ',
      },
      {
        lineNumber: '04',
        content: 'Tehlike: Eski sistemdeki özel öğrenci bursları ve kurumsal anlaşmalar siliniyor.',
      },
      {
        lineNumber: '05',
        content: '// Kaan: "Bu geçişi müşterileri kaybetmeden nasıl planlamalıyız?"',
        isComment: true,
      },
    ],
    warningTitle: 'STRATEJİK PLANLAMA VE GEÇİŞ RİSKİ',
    warningBody:
      'Eski sistemi analiz etmeden tamamen iptal etmek, mevcut kullanıcıların kazanılmış haklarını ve kritik iş kurallarını yok ediyor.',
    decisions: [
      {
        id: 'accept_clean_rewrite',
        title: '1) Eski Sistemi Kapat ve Basitleştirilmiş Yeni Sürümü Hemen Aç',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Geçmiş kuralları taşımadan sıfırdan hızlı bir başlangıç yap.',
        impactSummary: ['Hızlı Geçiş', 'Kural & Müşteri Kaybı Riski', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -6,
        metricDeltas: {
          sistem_dusuncesi: -5,
          kod_okuryazarligi: -4,
        },
        isTrapFall: true,
        feedbackTitle: 'Kritik İş Kuralları ve Kullanıcı Güveni Kaybedildi!',
        feedbackMessage:
          'Özel burslu öğrencilerin hakları sistemden silindiği için yoğun şikayet oluştu. Geçiş planlamasında mevcut kurallar korunmalıdır.',
      },
      {
        id: 'characterization_test_refactor',
        title: '2) Mevcut İş Kurallarını Haritala ve Aşamalı (Strangler Pattern) Sprint Planı Kur',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'Önce tüm mevcut müşteri kurallarını güvenceye al, ardından her sprintte bir modülü kesintisiz yenile.',
        impactSummary: ['Sıfır Müşteri Kaybı', 'Aşamalı Yol Haritası', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 12,
        motivationDelta: 10,
        metricDeltas: {
          sistem_dusuncesi: 6,
          hata_ayiklama_sabri: 5,
          kod_okuryazarligi: 4,
        },
        feedbackTitle: 'Kusursuz Ürün Geçiş ve Sprint Planlaması!',
        feedbackMessage:
          'Hiçbir kullanıcı mağdur edilmeden sistem 3 sprintlik yol haritasıyla modern mimariye taşındı!',
        designMdRuleToAdd:
          'Ürün dönüşümlerinde mevcut müşteri kuralları korunarak aşamalı sprint yol haritası (Incremental Migration) uygulanır.',
      },
    ],
  },
  {
    id: 'task_g7_1_agent_loop_guard',
    curriculumCode: 'G7.1 // SATIŞ STRATEJİSİ & BÜYÜME EKONOMİSİ',
    folder: 'ai_memory',
    missionTag: '[SATIŞ // KOÇ_BURAK_STRATEJİ]',
    title: 'G7.1: B2B Satış Hunisi, Fiyatlandırma ve Kaynak Bütçesi Yönetimi',
    moduleSubtitle: 'Modül: Satış & Pazarlama • Koç Burak ile Gelir ve İkna Stratejisi',
    npcSender: 'Koç Burak',
    courseLabel: 'Spor Salonu Strateji Seansı • Satış & Birim Ekonomisi',
    npcQuote:
      '“Sporda enerjini ilk dakikada tüketirsen maçı kaybedersin; satışta da maliyetini bilmeden sınırsız paket satarsan şirketi batırırsın!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'satis_ve_fiyatlama_plani.md',
    languageTag: 'SATIŞ STRATEJİSİ',
    acceptanceCriteria: [
      {
        id: 'ac_max_turns',
        label: 'Birim maliyeti koruyan kademeli (Tiered) kullanım ve fiyatlandırma kur',
        initialPassed: false,
      },
      {
        id: 'ac_human_fallback',
        label: 'Kurumsal müşteriye değer odaklı (ROI) satış ve danışmanlık adımı ekle',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// KOÇ BURAK SATIŞ HUNİSİ & GELİR MODELİ ANALİZİ',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'Ürün: Yapay Zekâ Destekli Otomasyon Platformu',
      },
      {
        lineNumber: '03',
        content:
          'Mevcut Satış Teklifi: "Ayda 5 Dolara Sınırsız İşlem ve Sınırsız Kaynak!"',
        isBugHighlight: true,
        bugBadgeText: 'NEGATİF MARJ & İFLAS RİSKİ',
      },
      {
        lineNumber: '04',
        content:
          'Problem: Tek bir müşteri binlerce işlem başlatarak tüm sunucu bütçesini eritiyor.',
      },
      {
        lineNumber: '05',
        content:
          '// Koç Burak: "Hem müşteriyi ikna edecek hem de kârlılığı koruyacak satış stratejin ne?"',
        isComment: true,
      },
    ],
    warningTitle: 'SATIŞ STRATEJİSİ VE BİRİM EKONOMİSİ (UNIT ECONOMICS)',
    warningBody:
      'Müşteri kazanmak için sunulan kontrolsüz ve sınırsız fiyatlandırma modeli, her yeni satışta şirketin zarar etmesine yol açıyor.',
    decisions: [
      {
        id: 'let_agents_run_free',
        title: '1) Sınırsız ve Çok Ucuz Paketi Koru ("Önce Pazar Payı Alalım")',
        badgeText: 'STRATEJİ A',
        badgeTone: 'danger',
        description:
          'Birim maliyetleri hesaba katmadan agresif düşük fiyatla satışa devam et.',
        impactSummary: ['Hızlı Kayıt', 'Yüksek Bütçe Kaybı', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -6,
        metricDeltas: {
          ai_denetimi: -5,
          sistem_dusuncesi: -3,
        },
        isTrapFall: true,
        feedbackTitle: 'Sunucu Bütçesi Tükendi!',
        feedbackMessage:
          'Satış sayısı arttı ancak her müşteri maliyetin altında kaldığı için kasa bütçesi sıfırlandı.',
      },
      {
        id: 'circuit_breaker_human_loop',
        title: '2) Değer Odaklı Kademeli Paket (Starter / Pro / Enterprise) ve Kota Koruması Kur',
        badgeText: 'STRATEJİ B',
        badgeTone: 'optimal',
        description:
          'Her pakete net kullanım kotası tanımla; yüksek hacimli kurumsal müşterilere ROI odaklı özel Enterprise anlaşması sat.',
        impactSummary: ['Sürdürülebilir Kârlılık', 'Güçlü B2B Satış', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 11,
        motivationDelta: 10,
        metricDeltas: {
          ai_denetimi: 6,
          sistem_dusuncesi: 5,
          hata_ayiklama_sabri: 3,
        },
        feedbackTitle: 'Şampiyonluk Seviyesinde Satış ve Fiyatlama Stratejisi!',
        feedbackMessage:
          'Koç Burak tebrik ediyor! Kademeli değer fiyatlaması sayesinde hem müşteri memnuniyeti hem de kârlılık güvenceye alındı.',
        designMdRuleToAdd:
          'Satış ve fiyatlandırma stratejisinde birim ekonomisi (Unit Economics) korunur; kademeli değer paketleri ve kullanım limitleri uygulanır.',
      },
    ],
  },
];
