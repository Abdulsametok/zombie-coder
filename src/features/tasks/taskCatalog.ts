/**
 * Zombie Coder — Mühendislik Görev Havuzu (Faz 4 & curriculum.md)
 * En az 3 görev türü:
 * 1) AI Denetimi & Zombie Kod Restorasyonu (zombie_projects)
 * 2) Kod Okuma & Sözdizimi Analizi (university - G1.1)
 * 3) Problem Çözme & Sınır Değer Testi (university / my_projects - G1.2)
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
    curriculumCode: 'G8.1 / ZOMBIE_AUTH',
    folder: 'zombie_projects',
    missionTag: '[MISSION // AUTH_HOTFIX]',
    title: 'Kurtarma Operasyonu: Legacy Login',
    moduleSubtitle: 'Modül: Legacy Auth • Kritik Güvenlik Denetimi',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB201 Dersi • Kod İnceleme #4',
    npcQuote: '“Gözün kapalı AI çıktısını pull edersen sunucu zombilere yem olur!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 15,
    fileName: 'authService.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_empty_pwd',
        label: 'Boş şifre girişlerini engelle',
        initialPassed: true,
      },
      {
        id: 'ac_sql_injection',
        label: 'SQL Injection ve zayıf sorgu desenini onar',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: "// AI Asistanı Önerisi (v1.2) - Prof. Demir'in uyarısı var!",
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'async function validateLogin(req, res) {',
      },
      {
        lineNumber: '03',
        content: '  const { email, password } = req.body;',
      },
      {
        lineNumber: '04',
        content: '  if (!email || !password) return res.status(400);',
      },
      {
        lineNumber: '05',
        content: '  // AI Kodu:',
        isComment: true,
      },
      {
        lineNumber: '06',
        content:
          "  const user = await db.query(`SELECT * FROM users WHERE email='${email}'`);",
        isBugHighlight: true,
        bugBadgeText: 'ZOMBIE HATA!',
      },
      {
        lineNumber: '07',
        content: '  return res.json({ token: generateToken(user) });',
      },
      {
        lineNumber: '08',
        content: '}',
      },
    ],
    warningTitle: 'GÜVENLİK TEHLİKESİ TESPİT EDİLDİ',
    warningBody:
      'AI Asistanı Önerisi: Kod çalışıyor görünüyor ancak parametreli sorgu kullanmadığı için SQL Injection riski barındırıyor!',
    decisions: [
      {
        id: 'accept_as_is',
        title: '1) AI Kodunu Olduğu Gibi Onayla',
        badgeText: 'HIZLI / RİSKLİ',
        badgeTone: 'danger',
        description: 'Testleri atla, doğrudan production ortamına push et.',
        impactSummary: ['-4 AI Denetimi', '-2 Kod Okuryazarlığı', '0 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -5,
        metricDeltas: {
          ai_denetimi: -4,
          kod_okuryazarligi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Zombie Trap Tetiklendi (Öğrenme Fırsatı)',
        feedbackMessage:
          'Ham SQL sorgusu test ortamında suistimal edildi. Ceza yok; ancak yarın için parametreli sorgu ve AI doğrulama adımı eklendi.',
        designMdRuleToAdd:
          'Veritabanı sorgularında string birleştirme yerine daima Prepared Statement / Parametreli sorgu zorunludur.',
      },
      {
        id: 'write_tests',
        title: '2) Uç Durumları İncele & Test Yaz',
        badgeText: 'DENGELİ',
        badgeTone: 'balanced',
        description:
          'Otomatize unit test ve fuzzing ekleyerek zayıflıkları izole et.',
        impactSummary: ['+4 Hata Ayıklama Sabrı', '+3 Sistem Düşüncesi', '10 dk sürer'],
        timeCostMinutes: 10,
        energyCost: 10,
        motivationDelta: 4,
        metricDeltas: {
          hata_ayiklama_sabri: 4,
          sistem_dusuncesi: 3,
        },
        feedbackTitle: 'Test Senaryoları Güvenceye Alındı',
        feedbackMessage:
          '+4 Hata Ayıklama Sabrı ve +3 Sistem Düşüncesi kazanıldı. Özel karakter içeren girdiler testte yakalandı.',
        designMdRuleToAdd:
          'Auth servislerinde her PR öncesi sınır durum (edge-case) birim testleri çalıştırılmalı.',
      },
      {
        id: 'refactor_query',
        title: '3) Refactor Et & Parametreli Yap',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Prepared statement kullanarak string interpolation açığını kalıcı kapat.',
        impactSummary: ['+6 AI Denetimi', '+4 Kod Okuryazarlığı', 'Tam Koruma'],
        timeCostMinutes: 15,
        energyCost: 12,
        motivationDelta: 8,
        metricDeltas: {
          ai_denetimi: 6,
          kod_okuryazarligi: 4,
          sistem_dusuncesi: 2,
        },
        feedbackTitle: 'Mükemmel Mühendislik Kararı!',
        feedbackMessage:
          '+6 AI Denetimi ve +4 Kod Okuryazarlığı kazanıldı. SQL Injection açığı kalıcı olarak kapatıldı.',
        designMdRuleToAdd:
          'AI tarafından üretilen tüm SQL/NoSQL sorguları parametreli yapıya dönüştürülmeden onaylanamaz.',
      },
    ],
  },
  {
    id: 'task_g1_1_loop_syntax',
    curriculumCode: 'G1.1 // SÖZDİZİMİ',
    folder: 'university',
    missionTag: '[MISSION // BMB101_LAB1]',
    title: 'G1.1: Döngü ve Koşul Düzenleme',
    moduleSubtitle: 'Modül: Algoritmalara Giriş • Kod Okuma',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB101 • 1. Sınıf Güz Görevi',
    npcQuote:
      '“Derste görmediğimiz tek satırlık karmaşık ifadeyi kopyalarsan sözlüde açıklayamazsın!”',
    difficulty: 'KOLAY (LOW)',
    difficultyLevel: 1,
    estimatedMinutes: 10,
    fileName: 'gradeCalculator.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_readable_loop',
        label: 'Adım adım izlenebilir döngü kur',
        initialPassed: true,
      },
      {
        id: 'ac_explain_logic',
        label: 'Geçme notu sınırını (50) doğru kontrol et',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI tek satırlık bit-shift ve zincirleme ternary üretti:',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export const calcPass = (scores: number[]) =>',
      },
      {
        lineNumber: '03',
        content:
          '  scores.reduce((a, b) => a + (b >> 0), 0) / (scores.length || 1) > 50;',
        isBugHighlight: true,
        bugBadgeText: 'EZBER TUZAĞI!',
      },
      {
        lineNumber: '04',
        content: '// Not: Tam 50 alan öğrenci bu koşulda kalıyor (> 50 vs >= 50)',
        isComment: true,
      },
    ],
    warningTitle: 'EZBER & SINIR DEĞER UYARISI',
    warningBody:
      'AI kodu hem tam 50 ortalamayı başarısız sayıyor hem de gereksiz bit-shift (b >> 0) kullanarak okunabilirliği bozuyor.',
    decisions: [
      {
        id: 'copy_paste_ai',
        title: '1) Tek Satırlık Havalı Kodu Teslim Et',
        badgeText: 'HIZLI / RİSKLİ',
        badgeTone: 'danger',
        description: 'Kısa kod her zaman iyidir diyerek açıklamadan gönder.',
        impactSummary: ['-3 Kod Okuryazarlığı', '-2 AI Denetimi', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 4,
        motivationDelta: -4,
        metricDeltas: {
          kod_okuryazarligi: -3,
          ai_denetimi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Sözlüde Açıklama Zorluğu Yaşandı',
        feedbackMessage:
          'Prof. Demir `b >> 0` ifadesinin neden orada olduğunu sorduğunda takıldın ve `>= 50` sınır hatası bulundu.',
      },
      {
        id: 'rewrite_readable',
        title: '2) Kodu Açık Döngüye Çevir ve `>= 50` Yap',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Okunabilir bir döngü yaz, boş dizi ve `>= 50` sınırını netleştir.',
        impactSummary: ['+5 Kod Okuryazarlığı', '+4 AI Denetimi', '10 dk'],
        timeCostMinutes: 10,
        energyCost: 8,
        motivationDelta: 7,
        metricDeltas: {
          kod_okuryazarligi: 5,
          ai_denetimi: 4,
        },
        feedbackTitle: 'Temiz ve Anlaşılır Kod!',
        feedbackMessage:
          '+5 Kod Okuryazarlığı kazanıldı. Kodu satır satır açıkladın ve 50 sınır değerini düzelttin.',
        designMdRuleToAdd:
          'Okunabilirlik, tek satırlık karmaşık ifadelerden (clever code) her zaman önceliklidir.',
      },
      {
        id: 'fix_only_operator',
        title: '3) Sadece `> 50` Kısmını `>= 50` Olarak Düzelt',
        badgeText: 'DENGELİ',
        badgeTone: 'balanced',
        description: 'Fonksiyonun geri kalanına dokunmadan sınır hatasını kapat.',
        impactSummary: ['+2 Hata Ayıklama Sabrı', '+1 Kod Okuryazarlığı', '7 dk'],
        timeCostMinutes: 7,
        energyCost: 6,
        motivationDelta: 3,
        metricDeltas: {
          hata_ayiklama_sabri: 2,
          kod_okuryazarligi: 1,
        },
        feedbackTitle: 'Sınır Hatası Çözüldü',
        feedbackMessage:
          'Testler geçti ancak okunabilirlik konusunda gelecekte refactoring gerekecek.',
      },
    ],
  },
  {
    id: 'task_g1_2_edge_case_rogue',
    curriculumCode: 'G1.2 // PROBLEM ÇÖZME',
    folder: 'my_projects',
    missionTag: '[MISSION // TERMINAL_ROGUE_v0.3b]',
    title: 'G1.2: Terminal Rogue Envanter & Sınır Testi',
    moduleSubtitle: 'Modül: Kişisel Indie Oyun Projesi • Problem Çözme',
    npcSender: 'Asistan Elif',
    courseLabel: 'Projelerim • Mini Indie Simülasyonu',
    npcQuote:
      '“Oyuncunun envanteri boşken en güçlü eşyayı arayan fonksiyonun çöküyor!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 15,
    fileName: 'inventorySystem.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_empty_inv',
        label: 'Boş envanter (`[]`) durumunda çökmemeli',
        initialPassed: false,
      },
      {
        id: 'ac_negative_durability',
        label: 'Kırık eşyaları (durability <= 0) filtrele',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI Tarafından Üretilen En Güçlü Eşya Bulucu:',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export function getBestWeapon(items: Weapon[]) {',
      },
      {
        lineNumber: '03',
        content: '  let max = items[0].power; // items boşsa TypeError!',
        isBugHighlight: true,
        bugBadgeText: 'HAPPY-PATH TUZAĞI!',
      },
      {
        lineNumber: '04',
        content: '  for (const item of items) {',
      },
      {
        lineNumber: '05',
        content: '    if (item.power > max) max = item.power;',
      },
      {
        lineNumber: '06',
        content: '  }',
      },
      {
        lineNumber: '07',
        content: '  return max;',
      },
      {
        lineNumber: '08',
        content: '}',
      },
    ],
    warningTitle: 'HAPPY-PATH (MUTLU YOL) TUZAĞI',
    warningBody:
      'AI yalnızca dolu envanter senaryosunu düşünmüş. Oyuncu oyuna yeni başladığında `items` dizisi boş (`[]`) olduğu için `items[0].power` satırında oyun çöküyor.',
    decisions: [
      {
        id: 'ignore_empty_array',
        title: '1) Başlangıçta Rastgele Kılıç Vererek Geç',
        badgeText: 'GEÇİCİ YAMA',
        badgeTone: 'danger',
        description:
          'Fonksiyonu düzeltmek yerine envanterin boş kalmamasını umut et.',
        impactSummary: ['-3 Sistem Düşüncesi', '-2 Hata Ayıklama Sabrı', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -3,
        metricDeltas: {
          sistem_dusuncesi: -3,
          hata_ayiklama_sabri: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Yan Etkiler Ortaya Çıktı',
        feedbackMessage:
          'Oyuncu tüm eşyalarını sattığında envanter yine boşaldı ve oyun tekrar çöktü.',
      },
      {
        id: 'guard_clause_and_test',
        title: '2) Boş Dizi Guard Clause Ekle & Sınır Testi Yaz',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          '`if (items.length === 0) return null;` kontrolü ve boş/negatif testleri ekle.',
        impactSummary: ['+5 Sistem Düşüncesi', '+5 Hata Ayıklama Sabrı', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 10,
        motivationDelta: 9,
        metricDeltas: {
          sistem_dusuncesi: 5,
          hata_ayiklama_sabri: 5,
          ai_denetimi: 3,
        },
        feedbackTitle: 'Terminal Rogue v0.4 Sağlamlaştırıldı!',
        feedbackMessage:
          '+5 Sistem Düşüncesi ve +5 Hata Ayıklama Sabrı kazanıldı. Boş envanter ve negatif güç sınır durumları tamamen güvenli.',
        designMdRuleToAdd:
          'Dizi/Koleksiyon işleyen her fonksiyonda boş dizi (`[]`) ve `null/undefined` sınır durumları ilk satırda kontrol edilmelidir.',
      },
      {
        id: 'optional_chaining_only',
        title: '3) Sadece `items[0]?.power ?? 0` Kullan',
        badgeText: 'DENGELİ',
        badgeTone: 'balanced',
        description: 'Çökmeyi önle ama negatif değerli eşya durumunu ertele.',
        impactSummary: ['+2 Kod Okuryazarlığı', '+2 Hata Ayıklama Sabrı', '8 dk'],
        timeCostMinutes: 8,
        energyCost: 7,
        motivationDelta: 4,
        metricDeltas: {
          kod_okuryazarligi: 2,
          hata_ayiklama_sabri: 2,
        },
        feedbackTitle: 'Çökme Önleyici Yama Uygulandı',
        feedbackMessage:
          'TypeError engellendi; ileride negatif değerler için ek test yazılabilecek.',
      },
    ],
  },
];
