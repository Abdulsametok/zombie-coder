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
  {
    id: 'task_g2_1_encapsulation',
    curriculumCode: 'G2.1 // NESNE YÖNELİMLİ TASARIM',
    folder: 'university',
    missionTag: '[MISSION // BMB102_OOP_WALLET]',
    title: 'G2.1: Cüzdan Kapsülleme (Encapsulation)',
    moduleSubtitle: 'Modül: OOP Temelleri • Public Değişken Kirliliği',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB102 • 1. Sınıf Bahar Görevi',
    npcQuote:
      '“Bakiyeyi `public` bırakırsan herhangi bir modül cüzdanı doğrudan eksiye düşürebilir!”',
    difficulty: 'ORTA (MID)',
    difficultyLevel: 2,
    estimatedMinutes: 12,
    fileName: 'campusWallet.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_private_balance',
        label: 'Bakiye (`balance`) alanını dış müdahaleye kapat (`private`)',
        initialPassed: false,
      },
      {
        id: 'ac_withdraw_validation',
        label: 'Negatif çekim ve yetersiz bakiye kontrolü ekle',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI Cüzdan Sınıfı Önerisi:',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export class CampusWallet {',
      },
      {
        lineNumber: '03',
        content: '  public balance: number = 100; // Dışarıdan doğrudan değiştirilebilir!',
        isBugHighlight: true,
        bugBadgeText: 'PUBLIC TUZAĞI!',
      },
      {
        lineNumber: '04',
        content: '  spend(amount: number) { this.balance -= amount; }',
      },
      {
        lineNumber: '05',
        content: '}',
      },
    ],
    warningTitle: 'KAPSÜLLEME İHLALİ (PUBLIC STATE)',
    warningBody:
      'AI `balance` değişkenini `public` tanımlamış ve `spend` metoduna bakiye sınırı koymamış. Kantin modülü yanlışlıkla `wallet.balance = -9999` ataması yapabiliyor.',
    decisions: [
      {
        id: 'keep_public_fast',
        title: '1) Public Bırak, Hızlıca Teslim Et',
        badgeText: 'HIZLI / RİSKLİ',
        badgeTone: 'danger',
        description: 'Erişim kolaylığı için public değişkeni koru.',
        impactSummary: ['-3 Sistem Düşüncesi', '-2 Kod Okuryazarlığı', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -4,
        metricDeltas: {
          sistem_dusuncesi: -3,
          kod_okuryazarligi: -2,
        },
        isTrapFall: true,
        feedbackTitle: 'Bakiye Bütünlüğü Bozuldu',
        feedbackMessage:
          'Test senaryosunda dış bir modül bakiyeyi doğrudan `-500` olarak ezdi. Kapsülleme kuralı ihlal edildi.',
      },
      {
        id: 'encapsulate_private_getter',
        title: '2) `private #balance` ve Doğrulamalı `spend()` Kur',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Alanı `private` yap, salt-okunur getter ve miktar doğrulaması ekle.',
        impactSummary: ['+5 Sistem Düşüncesi', '+4 Kod Okuryazarlığı', '12 dk'],
        timeCostMinutes: 12,
        energyCost: 9,
        motivationDelta: 8,
        metricDeltas: {
          sistem_dusuncesi: 5,
          kod_okuryazarligi: 4,
          ai_denetimi: 3,
        },
        feedbackTitle: 'Kapsülleme Başarıyla Tamamlandı!',
        feedbackMessage:
          'Cüzdan durumu artık yalnızca doğrulamalı sınıf metotları üzerinden güncellenebiliyor.',
        designMdRuleToAdd:
          'Domain sınıflarında durum değişkenleri (state) asla `public` bırakılmaz; değişimler doğrulamalı metotlarla yapılır.',
      },
    ],
  },
  {
    id: 'task_g3_2_complexity_timeout',
    curriculumCode: 'G3.2 // VERİ YAPILARI & KARMAŞIKLIK',
    folder: 'university',
    missionTag: '[MISSION // BMB203_PERF]',
    title: 'G3.2: 100.000 Kayıtta Sıralama ve Arama',
    moduleSubtitle: 'Modül: Veri Yapıları • Zaman Karmaşıklığı O(N²)',
    npcSender: 'Prof. Demir',
    courseLabel: 'BMB203 • 2. Sınıf Güz Görevi',
    npcQuote:
      '“10 elemanlı testte çalışan iç içe döngü, 100.000 öğrencide sunucuyu kilitler!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'studentRanker.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_sub_quadratic',
        label: 'O(N²) iç içe arama/sıralama döngüsünü kaldır',
        initialPassed: false,
      },
      {
        id: 'ac_preserve_order',
        label: '100.000 kaydı 200ms altında işle',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI Önerisi: İç içe Bubble Sort + Doğrusal Arama',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export function findDuplicateIds(ids: string[]) {',
      },
      {
        lineNumber: '03',
        content: '  for (let i = 0; i < ids.length; i++) {',
      },
      {
        lineNumber: '04',
        content: '    for (let j = i + 1; j < ids.length; j++) {',
        isBugHighlight: true,
        bugBadgeText: 'O(N²) TIMEOUT!',
      },
      {
        lineNumber: '05',
        content: '      if (ids[i] === ids[j]) return ids[i];',
      },
      {
        lineNumber: '06',
        content: '    }',
      },
      {
        lineNumber: '07',
        content: '  }',
      },
      {
        lineNumber: '08',
        content: '}',
      },
    ],
    warningTitle: 'ZAMAN KARMAŞIKLIĞI O(N²) TUZAĞI',
    warningBody:
      'AI küçük dizide çalışan iç içe döngü üretmiş. 100.000 elemanlı kampüs verisinde yaklaşık 5 milyar karşılaştırma yaparak Timeout hatasına yol açıyor.',
    decisions: [
      {
        id: 'ship_nested_loop',
        title: '1) İç İçe Döngüyü Koru ("Küçük Veride Çalışıyor")',
        badgeText: 'TIMEOUT RİSKİ',
        badgeTone: 'danger',
        description: 'Algoritmayı değiştirmeden olduğu gibi gönder.',
        impactSummary: ['-4 Sistem Düşüncesi', '-3 AI Denetimi', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -5,
        metricDeltas: {
          sistem_dusuncesi: -4,
          ai_denetimi: -3,
        },
        isTrapFall: true,
        feedbackTitle: 'Büyük Veri Testinde Timeout!',
        feedbackMessage:
          '100.000 elemanlı testte işlem süresi sınırı aşıldı. Hash Set tabanlı O(N) yaklaşıma geçilmesi gerekiyor.',
      },
      {
        id: 'use_hash_set_on',
        title: '2) `Set<string>` Kullanarak O(N) Karmaşıklığa İndir',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Tek geçişli Hash Set ile çalışma süresini saniyelerden milisaniyelere düşür.',
        impactSummary: ['+6 Sistem Düşüncesi', '+5 AI Denetimi', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 11,
        motivationDelta: 9,
        metricDeltas: {
          sistem_dusuncesi: 6,
          ai_denetimi: 5,
          kod_okuryazarligi: 3,
        },
        feedbackTitle: 'O(N) Optimizasyonu Başarılı!',
        feedbackMessage:
          '100.000 kayıt 14ms içinde tarandı! Gereksiz iç içe döngü ortadan kaldırıldı.',
        designMdRuleToAdd:
          'Koleksiyon eşleştirme ve tekillik kontrollerinde O(N²) iç içe döngü yerine O(N) Set/Map yapıları kullanılmalıdır.',
      },
    ],
  },
  {
    id: 'task_g5_1_zombie_rewrite_trap',
    curriculumCode: 'G5.1 // MİMARİ REFACTORING',
    folder: 'zombie_projects',
    missionTag: '[MISSION // ZOMBIE_SCHOLARSHIP_CORE]',
    title: 'G5.1: Spaghetti Burs Motoru Restorasyonu',
    moduleSubtitle: 'Modül: Yazılım Mimarisi • Rewrite İllüzyonu Tuzağı',
    npcSender: 'Kaan (Üst Sınıf Mentor)',
    courseLabel: 'BMB301 • 3. Sınıf Güz Zombie Projesi',
    npcQuote:
      '“AI her şeyi silip baştan yazalım derse dikkat et; eski koddaki gizli iş kurallarını uçurur!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'scholarshipEngine.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_keep_orphan_rule',
        label: 'Şehit/Gazi ve depremzede ek kontenjan kuralını koru',
        initialPassed: false,
      },
      {
        id: 'ac_modular_guard',
        label: 'Karmaşık if-else yapısını kuralları silmeden modülerleştir',
        initialPassed: true,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI "Temiz Yeniden Yazım (Clean Rewrite)" Önerisi:',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export function calcGrant(student: Student) {',
      },
      {
        lineNumber: '03',
        content: '  // Eski 80 satırlık özel durum kuralları silindi!',
        isBugHighlight: true,
        bugBadgeText: 'REWRITE TUZAĞI!',
      },
      {
        lineNumber: '04',
        content: '  return student.gpa > 3.5 ? 5000 : 0;',
      },
      {
        lineNumber: '05',
        content: '}',
      },
    ],
    warningTitle: 'YENİDEN YAZMA (REWRITE) İLLÜZYONU',
    warningBody:
      'AI eski spagetti kodu "temizlemek" adına tamamen silip tek satıra indirmiş; ancak eski kodun içindeki özel burs ve muafiyet iş kurallarını yok etmiş.',
    decisions: [
      {
        id: 'accept_clean_rewrite',
        title: '1) AI’ın Temiz Görünen Yeniden Yazımını Kabul Et',
        badgeText: 'İŞ KURALI KAYBI',
        badgeTone: 'danger',
        description: 'Eski karmaşık kuralları silip sadece GPA kontrolü bırak.',
        impactSummary: ['-5 Sistem Düşüncesi', '-4 Kod Okuryazarlığı', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 5,
        motivationDelta: -6,
        metricDeltas: {
          sistem_dusuncesi: -5,
          kod_okuryazarligi: -4,
        },
        isTrapFall: true,
        feedbackTitle: 'Kritik İş Kuralları Silindi!',
        feedbackMessage:
          'Kod kısaldı ancak özel durumlu öğrencilerin burs hakları sistemden silindi. Regresyon testleri başarısız oldu.',
      },
      {
        id: 'characterization_test_refactor',
        title: '2) Önce Karakterizasyon Testi Yaz, Sonra Adım Adım Ayristır',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Mevcut tüm iş kurallarını birim testlerle kilitleyip fonksiyonlara böl.',
        impactSummary: ['+6 Sistem Düşüncesi', '+5 Hata Ayıklama Sabrı', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 12,
        motivationDelta: 10,
        metricDeltas: {
          sistem_dusuncesi: 6,
          hata_ayiklama_sabri: 5,
          kod_okuryazarligi: 4,
        },
        feedbackTitle: 'Gerçek Legacy Restorasyonu!',
        feedbackMessage:
          'Hiçbir iş kuralı kaybedilmeden spagetti kod modüler strateji fonksiyonlarına ayrıldı.',
        designMdRuleToAdd:
          'Legacy/Zombie kod refactor edilirken önce mevcut iş kurallarını koruyan karakterizasyon testleri yazılır, körü körüne rewrite yapılmaz.',
      },
    ],
  },
  {
    id: 'task_g7_1_agent_loop_guard',
    curriculumCode: 'G7.1 // AI AGENT ORKESTRASYONU',
    folder: 'ai_memory',
    missionTag: '[MISSION // BMB401_AGENT_ORCHESTRATOR]',
    title: 'G7.1: Çoklu AI Agent Sonsuz Döngü Denetimi',
    moduleSubtitle: 'Modül: 4. Sınıf AI Orkestrasyonu • Kota & Döngü Koruması',
    npcSender: 'Asistan Elif',
    courseLabel: 'BMB401 • 4. Sınıf Güz Görevi',
    npcQuote:
      '“Kodlayıcı agent ile Testçi agent birbirini sonsuz döngüde tetikliyor; API kotası eriyor!”',
    difficulty: 'ZOR (HIGH)',
    difficultyLevel: 3,
    estimatedMinutes: 15,
    fileName: 'agentOrchestrator.ts',
    languageTag: 'TS v5.3',
    acceptanceCriteria: [
      {
        id: 'ac_max_turns',
        label: 'Maksimum iterasyon (`MAX_TURNS`) ve devre kesici ekle',
        initialPassed: false,
      },
      {
        id: 'ac_human_fallback',
        label: 'Eşik aşıldığında insan onayına (Human-in-the-loop) düşür',
        initialPassed: false,
      },
    ],
    codeLines: [
      {
        lineNumber: '01',
        content: '// AI Agent Orkestrasyon Döngüsü:',
        isComment: true,
      },
      {
        lineNumber: '02',
        content: 'export async function runAgentPipeline(task: string) {',
      },
      {
        lineNumber: '03',
        content: '  while (!testerAgent.isSatisfied()) {',
        isBugHighlight: true,
        bugBadgeText: 'SONSUZ AGENT DÖNGÜSÜ!',
      },
      {
        lineNumber: '04',
        content: '    const patch = await coderAgent.fix(task);',
      },
      {
        lineNumber: '05',
        content: '    await testerAgent.verify(patch);',
      },
      {
        lineNumber: '06',
        content: '  }',
      },
      {
        lineNumber: '07',
        content: '}',
      },
    ],
    warningTitle: 'SONSUZ DÖNGÜ & KOTA TÜKETİM TUZAĞI',
    warningBody:
      'Üst seviye orkestrasyon görevinde `while (!testerAgent.isSatisfied())` döngüsüne üst sınır (`maxIterations`) ve bütçe koruyucu konulmamış.',
    decisions: [
      {
        id: 'let_agents_talk_forever',
        title: '1) Agentları Serbest Bırak ("Elbet Çözülür")',
        badgeText: 'KOTA İFLASI',
        badgeTone: 'danger',
        description: 'Üst sınır koymadan otonom döngüyü çalıştır.',
        impactSummary: ['-5 AI Denetimi', '-4 Sistem Düşüncesi', '5 dk'],
        timeCostMinutes: 5,
        energyCost: 6,
        motivationDelta: -6,
        metricDeltas: {
          ai_denetimi: -5,
          sistem_dusuncesi: -4,
        },
        isTrapFall: true,
        feedbackTitle: 'API Kotası Tükendi!',
        feedbackMessage:
          'İki agent 400 kez birbirini tetikledi ve günlük token bütçesi sıfırlandı.',
      },
      {
        id: 'add_circuit_breaker_max_steps',
        title: '2) `MAX_STEPS = 3` Devre Kesici & İnsan Onayı Ekle',
        badgeText: 'EN İYİ ÇÖZÜM',
        badgeTone: 'optimal',
        description:
          'Adım sınırı, token bütçesi kontrolü ve insan devralma mekanizması kur.',
        impactSummary: ['+7 AI Denetimi', '+5 Sistem Düşüncesi', '15 dk'],
        timeCostMinutes: 15,
        energyCost: 11,
        motivationDelta: 10,
        metricDeltas: {
          ai_denetimi: 7,
          sistem_dusuncesi: 5,
          hata_ayiklama_sabri: 3,
        },
        feedbackTitle: 'Güvenli AI Orkestrasyonu Kuruldu!',
        feedbackMessage:
          'Agent döngüsü 3 deneme ile sınırlandırıldı ve bütçe aşımı tamamen engellendi.',
        designMdRuleToAdd:
          'Otonom AI agent döngülerinde her zaman açık bir `maxIterations` devre kesicisi ve insan onayı (fallback) bulunmalıdır.',
      },
    ],
  },
];
