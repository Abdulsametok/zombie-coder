/**
 * Zombie Coder — Üniversite Ders, Soru, Ödev ve Sınav Kataloğu
 *
 * Prensipler:
 * 1. Kodlama sözdizimi ezberi yerine AI-Native düşünce yapısı, sistem farkındalığı ve mimari kararlar.
 * 2. Sorular yalnızca daha önce işlenen konulardan sorulur (işlenmemiş konu sorulmaz).
 * 3. Cevap anlamsal doğruluğu >= %70 ise hoca onaylayıcı ilerler; < %70 ise doğru yaklaşımı özetler.
 * 4. Ders sonunda 1 ödev verilir; ertesi gün derse başlamadan önce ödev denetlenir.
 * 5. Her 5 dersten sonra vize/sınav oturumu tetiklenir.
 */

export interface InLectureQuestion {
  id: string;
  questionText: string;
  expectedKeywords: string[];
  semanticKeywords: string[];
  correctApproachSummary: string;
  successFeedback: string;
}

export interface LectureHomeworkOption {
  id: string;
  label: string;
  description: string;
  isOptimal: boolean;
  feedback: string;
}

export interface LectureHomework {
  id: string;
  title: string;
  topic: string;
  problemStatement: string; // İşlenen konu / sorun
  targetOutput: string; // Hedeflenen mühendislik çıktısı
  options: LectureHomeworkOption[];
  xpReward: number;
}

export interface BlackboardSlide {
  heading: string;
  bulletPoints: string[];
  chalkDiagram?: string;
  highlightText?: string;
}

export interface UniversityLecture {
  id: string;
  orderNumber: number; // 1, 2, 3, 4, 5...
  title: string;
  courseName: string;
  professorName: string;
  slides: BlackboardSlide[];
  question: InLectureQuestion;
  homework: LectureHomework;
}

export interface ExamQuestion {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface SemesterExam {
  examNumber: number;
  title: string;
  coveredLecturesDescription: string;
  coveredLectureOrders: number[];
  questions: ExamQuestion[];
  passingScore: number;
}

export const UNIVERSITY_LECTURES: UniversityLecture[] = [
  {
    id: 'lec_1',
    orderNumber: 1,
    title: 'Yazılım Mühendisliğine Giriş & AI-Native Düşünce',
    courseName: 'YAZ 101 — Yazılım Mühendisliği Temelleri',
    professorName: 'Prof. Dr. Demir',
    slides: [
      {
        heading: '1. KOD EZBERİ DÖNEMİNİN SONU',
        bulletPoints: [
          'Yapay zeka (LLM) ile kod parçası üretmek artık sıfır maliyetli bir emtiaya dönüştü.',
          'Geleneksel sözdizimi ezberi yerine "sistem farkındalığı", "spesifikasyon doğruluğu" ve "çıktı denetimi" esastır.',
          'Mühendisin işi klavyede harf dizmek değil; problemi sınırlarıyla modellemektir.',
        ],
        highlightText: 'Sözdizimi ameleliği bitti, mimari ve sistem denetimi başladı.',
      },
      {
        heading: '2. AI-NATIVE YAZILIM PRENSİPLERİ',
        bulletPoints: [
          'Girdi -> Model -> Çıktı zincirinde kritik halka "Denetim Filtresi"dir.',
          'AI modelleri bağlamı tahmin eder ama sorumluluk almaz; mimari sorumluluk daima mühendistedir.',
          'Test edilemeyen ve sınırları çizilmeyen bir prompt, kontrolsüz bir teknik borçtur.',
        ],
        chalkDiagram: '[Girdi Spesifikasyonu] ──> [AI Kod Üretimi] ──> [Mühendis Denetimi & Doğrulama] ──> [Sistem Entegrasyonu]',
      },
    ],
    question: {
      id: 'q_lec_1',
      questionText:
        'AI-Native bir yazılım geliştirme sürecinde, mühendisin birincil sorumluluğu doğrudan kod yazmak yerine neye evrilmiştir?',
      expectedKeywords: ['denetim', 'mimari', 'spesifikasyon', 'doğrulama', 'sınır', 'kontrol', 'tasarım', 'karar'],
      semanticKeywords: ['sistem', 'analiz', 'test', 'sorumluluk', 'yönetim'],
      correctApproachSummary:
        'Yapay zeka kod parçalarını üretirken, mühendisin birincil görevi sistem mimarisini tasarlamak, sınır koşullarını (spesifikasyonları) net belirlemek ve üretilen çıktıyı titizlikle denetlemektir.',
      successFeedback:
        'Harika bir tespit! Aynen tahtada vurguladığımız gibi; kod üretimi otomatiğe bağlandı, asıl mühendislik spesifikasyon netliği ve denetim yeteneğidir.',
    },
    homework: {
      id: 'hw_lec_1',
      title: 'Ödev 1: Çekirdek Sistem Spesifikasyonu & Denetim Kalkanı',
      topic: 'Yazılım Mühendisliği & AI-Native Prensipleri',
      problemStatement:
        'Üniversite öğrenci bilgi sistemi için AI tarafından yazılan kayıt modülü, geçerlilik kontrolleri yapılmadan doğrudan veritabanına bağlanmış ve kontrolsüz kabul üretmektedir.',
      targetOutput:
        'AI kodunu doğrudan çalıştırmak yerine; girdi sınırlarını doğrulayan (validation), yetkisiz erişimi engelleyen ve veri akışını denetleyen koruyucu bir mimari katman belirlemek.',
      options: [
        {
          id: 'hw1_opt_a',
          label: 'Mühendislik Çözümü A: Katmanlı Spesifikasyon ve Doğrulama Katmanı Ekle',
          description:
            'AI kodunun önüne açık girdi şeması (schema validation), rol yetki denetimi ve sınır kontrolleri ekleyerek sistemi güvenceye al.',
          isOptimal: true,
          feedback:
            'Tebrikler! AI-Native prensiplerine tam uygun olarak kodun önüne mimari doğrulama katmanı koydun.',
        },
        {
          id: 'hw1_opt_b',
          label: 'Hızlı Çözüm B: AI Kodunu Aynen Kabul Et, Hata Çıkarsa İlgilen',
          description:
            'Geliştirme hızını düşürmemek adına AI çıktısını doğrudan çalıştır ve kullanıcı şikayetlerine göre yama yap.',
          isOptimal: false,
          feedback:
            'Tehlikeli yaklaşım! Kontrolsüz AI kodu canlıya alındığında kritik veri sızıntılarına yol açar.',
        },
      ],
      xpReward: 30,
    },
  },
  {
    id: 'lec_2',
    orderNumber: 2,
    title: 'Modülerlik, Sorumluluk Ayrımı (SoC) ve Bağımlılık',
    courseName: 'YAZ 102 — Sistem Mimarisi & Modüler Tasarım',
    professorName: 'Prof. Dr. Demir',
    slides: [
      {
        heading: '1. AYRIK SORUMLULUK PRENSİBİ (Separation of Concerns)',
        bulletPoints: [
          'Her modül veya bileşen yalnızca tek bir işi mükemmel yapmalıdır.',
          'Görsel katman veritabanını bilmemeli; iş mantığı kullanıcı arayüzüne bağımlı olmamalıdır.',
          'Yapay zekaya "bana tüm sistemi tek dosyada yaz" demek en ölümcül spagetti tuzağıdır.',
        ],
        highlightText: 'Sıkı bağımlılık (tight coupling) felakettir; gevşek bağımlılık (loose coupling) özgürlüktür.',
      },
      {
        heading: '2. YAPAY ZEKAYI MODÜLER YÖNETMEK',
        bulletPoints: [
          'Büyük bir sistemi parçalamadan AI modeline verirseniz halüsinasyon ve bağlam kaybı yaşar.',
          'Sistemi küçük arayüzlerle (Interface / Contract) ayırın; her modülü izole denetleyin.',
        ],
        chalkDiagram: '[UI / Sunum Katmanı] ──(Arayüz / API)──> [İş Mantığı Servisi] ──(Veri Katmanı)──> [Veritabanı]',
      },
    ],
    question: {
      id: 'q_lec_2',
      questionText:
        'Yapay zekaya bir sistemi tek bir monolitik blok halinde yazdırmak neden bakım ve hata ayıklama krizine yol açar?',
      expectedKeywords: ['bağımlılık', 'spagetti', 'modüler', 'ayrım', 'hata', 'takip', 'sorumluluk', 'monolit'],
      semanticKeywords: ['izolasyon', 'test', 'bağlam', 'karmaşıklık'],
      correctApproachSummary:
        'Tek parça monolitik kodlarda bileşenler sıkı bağımlı (tightly coupled) hale gelir. Bir yeri değiştirmek beklenmeyen yan etkilere yol açar ve AI bağlam sınırını aşarak hataları tespit etmeyi imkansızlaştırır.',
      successFeedback:
        'Doğru teşhis! Modüler olmayan kodda sorumluluklar birbirine girer ve tek bir güncelleme tüm sistemi çökertebilir.',
    },
    homework: {
      id: 'hw_lec_2',
      title: 'Ödev 2: Spagetti Monoliti Modüler Servislere Ayrıştırma',
      topic: 'Sorumluluk Ayrımı ve Gevşek Bağlantı',
      problemStatement:
        'Kullanıcı kaydı, ödeme çekimi, fatura PDF üretimi ve e-posta gönderimi 800 satırlık tek bir fonksiyonda birbirine bağlanmış durumdadır.',
      targetOutput:
        'Fonksiyonu AuthServisi, OdemeServisi, BelgeServisi ve BildirimServisi olmak üzere 4 bağımsız ve test edilebilir modüle ayrıştırmak.',
      options: [
        {
          id: 'hw2_opt_a',
          label: 'Mühendislik Çözümü A: Sözleşmeli (Interface-Driven) 4 Ayrı Servise Böl',
          description:
            'Her servisin girdisini ve çıktısını TypeScript arayüzleriyle sabitle; birbirlerini yalnızca bu arayüzler üzerinden çağıracak şekilde refactor et.',
          isOptimal: true,
          feedback:
            'Kusursuz modüler refactor! Artık e-posta servisi çökse bile ödeme veya kayıt modülü çalışmaya devam eder.',
        },
        {
          id: 'hw2_opt_b',
          label: 'Hızlı Çözüm B: Tek Dosyada Bırak, Fonksiyon İçine Yorum Satırları Ekle',
          description:
            'Dosyayı bölmeden sadece aralara açıklama başlıkları koyarak tek gövdede tutmaya devam et.',
          isOptimal: false,
          feedback:
            'Yetersiz yaklaşım. Yorum satırları mimari ayrılık sağlamaz; monolitik spagetti tehlikesi devam eder.',
        },
      ],
      xpReward: 35,
    },
  },
  {
    id: 'lec_3',
    orderNumber: 3,
    title: 'Uç Durumlar (Edge Cases) & Defansif Sistem Tasarımı',
    courseName: 'YAZ 201 — Defansif Programlama & Hata Yönetimi',
    professorName: 'Prof. Dr. Demir',
    slides: [
      {
        heading: '1. "HAPPY PATH" (MUTLU YOL) YANILSAMASI',
        bulletPoints: [
          'AI modelleri eğitildikleri veriler gereği en olası, hatasız senaryoları üretmeye meyillidir.',
          'Gerçek dünyada ağ kopar, veritabanı zaman aşımına uğrar, kullanıcı negatif sayı yazar, bellek dolar.',
          'Mühendislik, sistemin normal şartlarda değil, anormal şartlarda nasıl davrandığıdır.',
        ],
        highlightText: 'Sistemi mutlu yolda değil; fırtınalı uç sınırlarda test edin.',
      },
      {
        heading: '2. DEFANSİF TASARIM İLKELERİ',
        bulletPoints: [
          'Asla dışarıdan gelen girdiye güvenme (Zero-Trust Input).',
          'Tüm uç sınırları (boş dizi, null, sıfıra bölme, aşırı uzun metin) açıkça doğrula.',
          'Hataları sessizce yutma (fail fast & informative errors).',
        ],
        chalkDiagram: '[Ham Girdi] ──(Sınır Denetimi / Edge Check)──> [Güvenli Çekirdek] ──> [Öngörülebilir Sonuç]',
      },
    ],
    question: {
      id: 'q_lec_3',
      questionText:
        'Yapay zekanın sunduğu bir çözümün "Happy Path" tuzağına düşmesini engellemek için kod denetiminde ilk neye bakarız?',
      expectedKeywords: ['uç durum', 'sınır', 'edge case', 'null', 'hata', 'exception', 'sıfır', 'doğrulama', 'girdi'],
      semanticKeywords: ['defansif', 'kontrol', 'beklenmeyen', 'timeout'],
      correctApproachSummary:
        'İlk olarak sınır koşullarına (boş veri, null, sınır aşımı, ağ zaman aşımı ve beklenmeyen kullanıcı davranışlarına) ve bu durumların sistemde nasıl ele alındığına (hata yönetimine) bakarız.',
      successFeedback:
        'Çok doğru! Happy path sadece buzdağının görünen kısmıdır; mühendis buzdağının altındaki uç durumları denetler.',
    },
    homework: {
      id: 'hw_lec_3',
      title: 'Ödev 3: Uç Sınır Korumalı Kota & İstek Sınırlayıcı (Rate Limiter)',
      topic: 'Defansif Programlama ve Uç Durumlar',
      problemStatement:
        'Sistemdeki AI Token kotası sadece pozitif düşüşleri hesaplıyor; kullanıcı aynı anda 10 paralel istek attığında eksiye düşerek sonsuz hak kazanıyor.',
      targetOutput:
        'Atomik kilit (mutex/lock) ve negatif bakiye engelleyici sınır denetimiyle donatılmış defansif kota koruyucusu tasarlamak.',
      options: [
        {
          id: 'hw3_opt_a',
          label: 'Mühendislik Çözümü A: Atomik Bakiye Kontrolü ve Eşzamanlı İstek Kilidi',
          description:
            'İstek gelince önce bakiye kilitlenir, token düşülür, sıfırın altı kesin olarak reddedilir.',
          isOptimal: true,
          feedback:
            'Harika defansif refleks! Paralel istek yarış koşulu (race condition) başarıyla engellendi.',
        },
        {
          id: 'hw3_opt_b',
          label: 'Hızlı Çözüm B: İstemci Tarafında (Frontend) Butonu Devre Dışı Bırak',
          description:
            'Yalnızca ekrandaki butona basılmasını engelleyerek sunucu tarafındaki kilit mantığını es geç.',
          isOptimal: false,
          feedback:
            'Ciddi güvenlik açığı! Saldırgan doğrudan API isteği atarak istemci engelini kolayca aşar.',
        },
      ],
      xpReward: 40,
    },
  },
  {
    id: 'lec_4',
    orderNumber: 4,
    title: 'Veri Tutarlılığı, Yan Etkiler ve Saf Fonksiyonlar',
    courseName: 'YAZ 202 — Veri Akışı & Fonksiyonel Güvenilirlik',
    professorName: 'Prof. Dr. Demir',
    slides: [
      {
        heading: '1. YAN ETKİ (SIDE-EFFECT) VE KARMAŞA',
        bulletPoints: [
          'Bir fonksiyon aldığı argümanlar haricinde dış dünyadaki global durumu gizlice değiştiriyorsa yan etkisi vardır.',
          'Yan etkiler kodun tekrar oynatılabilirliğini (idempotency) ve test edilebilirliğini imkansız kılar.',
          'AI modelleri global değişkenleri sessizce mutate etmeye bayılır; bu da hayalet buglara sebep olur.',
        ],
        highlightText: 'Aynı girdi -> Her zaman aynı çıktı. Saf fonksiyonların gücü budur.',
      },
      {
        heading: '2. DEĞİŞMEZLİK (IMMUTABILITY) VE GÜVENLİK',
        bulletPoints: [
          'Mevcut durumu ezmek (mutating state) yerine daima yeni bir durum nesnesi türetin.',
          'Durum geçmişi izlenebilir olmalı; zaman yolculuğu ile hata kökeni anında saptanabilmelidir.',
        ],
        chalkDiagram: 'Girdi (State A) ──[Saf Fonksiyon]──> Yeni Çıktı (State B)  (State A asla ezilmez!)',
      },
    ],
    question: {
      id: 'q_lec_4',
      questionText:
        'Bir fonksiyonun dış dünyadaki global değişkenleri veya veritabanını habersiz değiştirmesi (yan etki), yapay zeka ile hata ayıklamayı neden zorlaştırır?',
      expectedKeywords: ['yan etki', 'öngörülemez', 'global', 'debug', 'takip', 'tutarsız', 'test', 'izole', 'durum'],
      semanticKeywords: ['saf fonksiyon', 'mutasyon', 'belirsizlik'],
      correctApproachSummary:
        'Yan etkiler fonksiyonun bağımsız test edilmesini engeller; hatanın fonksiyonun içinden mi yoksa dışarıdaki başka bir kodun global durumu değiştirmesinden mi kaynaklandığı bilinemez, öngörülemezlik doğar.',
      successFeedback:
        'Tebrikler! Yan etki içeren kod izole edilemez. Saf fonksiyonlar ve değişmezlik (immutability) hatasız sistemlerin omurgasıdır.',
    },
    homework: {
      id: 'hw_lec_4',
      title: 'Ödev 4: Değişmez (Immutable) Öğrenci Durum Yöneticisi',
      topic: 'Saf Fonksiyonlar & Yan Etkisiz Durum Yönetimi',
      problemStatement:
        'Oyuncunun envanter ve enerji durumu doğrudan `player.energy = player.energy - 10` şeklinde mutasyona uğratıldığı için önceki durumlar kaybolmakta ve senkronizasyon çökmektedir.',
      targetOutput:
        'Mevcut durumu ezmeyen, saf fonksiyon mantığıyla yeni durum kopyası üreten temiz bir durum mekanizması kurgulamak.',
      options: [
        {
          id: 'hw4_opt_a',
          label: 'Mühendislik Çözümü A: Spread/Kopya Tabanlı Saf Durum Güncellemesi',
          description:
            'Eski durumu koruyarak `{ ...prev, energy: nextEnergy }` formatında yeni referans üret ve geçmişi denetlenebilir kıl.',
          isOptimal: true,
          feedback:
            'Mükemmel fonksiyonel mimari! Reaktivite motoru değişikliği anında algılar ve veri yarışları önlenir.',
        },
        {
          id: 'hw4_opt_b',
          label: 'Hızlı Çözüm B: Global Nesneyi Doğrudan Değiştirmeye Devam Et',
          description:
            'Yeni nesne oluşturma maliyetinden kaçınmak için referansı doğrudan bellekte mutate et.',
          isOptimal: false,
          feedback:
            'Hatalı yaklaşım. Doğrudan mutasyon ekranın güncellenmemesine ve hayalet buglara yol açar.',
        },
      ],
      xpReward: 40,
    },
  },
  {
    id: 'lec_5',
    orderNumber: 5,
    title: 'Kod Denetimi (Code Audit) & Güvenlik Açığı Savunması',
    courseName: 'YAZ 301 — Yazılım Güvenliği & Kod Denetimi',
    professorName: 'Prof. Dr. Demir',
    slides: [
      {
        heading: '1. ÇALIŞAN KOD != DOĞRU KOD',
        bulletPoints: [
          'Acemi yazılımcı "çalışıyorsa dokunma" der; kıdemli mühendis "nasıl çalıştığını ve ne zaman çökeceğini" sorgular.',
          'Yapay zeka halüsinasyonla açık kütüphaneler uydurabilir, güvensiz regexler yazabilir veya SQL injection açıkları bırakabilir.',
          'Kod denetimi (audit), otomatik araçlar ve insan gözünün birleşik süzgecidir.',
        ],
        highlightText: 'Güvenlik bir eklenti değil; sistemin temel mimari refleksidir.',
      },
      {
        heading: '2. TEHLİKELİ ENJEKSİYONLAR VE SALDIRI YÜZEYİ',
        bulletPoints: [
          'Kullanıcıdan gelen her girdi potansiyel bir saldırı vektörüdür.',
          'Parametrik sorgular, sanitization kütüphaneleri ve en az yetki prensibi (PoLP) zorunludur.',
        ],
        chalkDiagram: '[Saldırgan Girdisi] ──> [Sanitize & Tip Denetimi] ──> [Parametrik Sorgu] ──> [Güvenli DB]',
      },
    ],
    question: {
      id: 'q_lec_5',
      questionText:
        'AI tarafından üretilen ve görünürde hatasız çalışan bir API kodunu yayına almadan önce güvenlik açısından hangi temel prensiple inceleriz?',
      expectedKeywords: ['güven', 'sıfır', 'girdi', 'doğrulama', 'enjeksiyon', 'injection', 'yetki', 'sanitize', 'denetim'],
      semanticKeywords: ['güvenlik', 'açık', 'kontrol', 'parametre'],
      correctApproachSummary:
        'Sıfır güven (Zero Trust) prensibiyle inceleriz. Dışarıdan gelen tüm girdilerin doğrulanması (sanitization/validation), parametrik sorgu kullanımı ve yetki sınırlarının (PoLP) aşılmadığı açıkça denetlenmelidir.',
      successFeedback:
        'Harika bir cevap! Asla AI koduna körü körüne güvenilmez. Sıfır güven prensibi modern sistemlerin temelidir.',
    },
    homework: {
      id: 'hw_lec_5',
      title: 'Ödev 5: SQL & Komut Enjeksiyon Kalkanı ve Audit Raporu',
      topic: 'Kod Denetimi ve Güvenlik Açığı Tespiti',
      problemStatement:
        'Yapay zekanın ürettiği arama API\'si, kullanıcıdan gelen arama metnini doğrudan SQL sorgusu içine birleştirerek (`query = "SELECT * FROM users WHERE name = " + input`) çalıştırmaktadır.',
      targetOutput:
        'Sorguyu parametrik formata dönüştürerek SQL injection açığını tamamen kapatmak ve güvenlik audit raporu oluşturmak.',
      options: [
        {
          id: 'hw5_opt_a',
          label: 'Mühendislik Çözümü A: Parametrik Hazır Sorgu (Prepared Statement) Kullan',
          description:
            'Kullanıcı girdisini sorgu gövdesinden ayırarak parametre olarak geçir ve veritabanı motorunun girdiyi komut olarak yorumlamasını imkansız kıl.',
          isOptimal: true,
          feedback:
            'Tebrikler! SQL Injection saldırı vektörü kalıcı olarak bertaraf edildi.',
        },
        {
          id: 'hw5_opt_b',
          label: 'Hızlı Çözüm B: Yalnızca Metindeki Tırnak İşaretlerini Boşlukla Değiştir',
          description:
            'Karmaşık parametrik kütüphane kurmak yerine regex ile sadece tek tırnakları filtrele.',
          isOptimal: false,
          feedback:
            'Tehlikeli ve yetersiz! Hex veya unicode bypass teknikleriyle bu filtre kolayca aşılabilir.',
        },
      ],
      xpReward: 50,
    },
  },
];

export const SEMESTER_EXAMS: SemesterExam[] = [
  {
    examNumber: 1,
    title: '1. DÖNEM VİZE SINAVI (Ders 1 – 5 Mühendislik Değerlendirmesi)',
    coveredLecturesDescription:
      'Yazılım Mühendisliği Giriş, Modülerlik & SoC, Uç Durumlar, Saf Fonksiyonlar ve Kod Denetimi',
    coveredLectureOrders: [1, 2, 3, 4, 5],
    passingScore: 70,
    questions: [
      {
        id: 'exam1_q1',
        prompt:
          '1. Soru (Ders 1): AI-Native bir geliştirme modelinde yazılım mühendisinin katma değeri en çok hangi aşamada ortaya çıkar?',
        options: [
          {
            id: 'e1q1_a',
            text: 'Sözdizimini satır satır elle yazıp kopyala-yapıştır yaparken.',
            isCorrect: false,
            explanation: 'Sözdizimi yazımı yapay zeka tarafından otomatikleştirilmiştir.',
          },
          {
            id: 'e1q1_b',
            text: 'Sistem sınırlarını, spesifikasyonları belirlerken ve üretilen mimariyi denetlerken.',
            isCorrect: true,
            explanation: 'Doğru! Mühendisin değeri mimari kararlar ve çıktı denetimindedir.',
          },
          {
            id: 'e1q1_c',
            text: 'Hiçbir teste gerek duymadan ilk çıkan kodu hemen sunucuya yüklerken.',
            isCorrect: false,
            explanation: 'Bu kontrolsüz felakete davetiyedir.',
          },
        ],
      },
      {
        id: 'exam1_q2',
        prompt:
          '2. Soru (Ders 2): Sıkı bağlılık (tight coupling) yerine gevşek bağlılık (loose coupling) tercih etmenin temel mühendislik faydası nedir?',
        options: [
          {
            id: 'e1q2_a',
            text: 'Tek bir modüldeki değişikliğin veya hatanın tüm sistemi zincirleme çökertmesini engellemek.',
            isCorrect: true,
            explanation: 'Doğru! Gevşek bağlı modüller izole çalışır ve bağımsız test edilir.',
          },
          {
            id: 'e1q2_b',
            text: 'Kod satır sayısını yapay olarak 10 katına çıkarmak.',
            isCorrect: false,
            explanation: 'Amaç satır şişirmek değil, modüler bağımsızlık kazanmaktır.',
          },
          {
            id: 'e1q2_c',
            text: 'Veritabanı bağlantılarını tamamen ortadan kaldırmak.',
            isCorrect: false,
            explanation: 'Modülerlik veritabanını kaldırmaz, erişim katmanını izole eder.',
          },
        ],
      },
      {
        id: 'exam1_q3',
        prompt:
          '3. Soru (Ders 3): "Happy Path" testleri geçmiş bir API için defansif programlama gereği ne yapılmalıdır?',
        options: [
          {
            id: 'e1q3_a',
            text: 'Kod kusursuz kabul edilip test süreci sonlandırılmalıdır.',
            isCorrect: false,
            explanation: 'Happy path sadece en ideal senaryodur; uç durumlar test edilmemiştir.',
          },
          {
            id: 'e1q3_b',
            text: 'Boş veri (null), aşırı yük, zaman aşımı ve hatalı girdi sınır senaryoları simüle edilmelidir.',
            isCorrect: true,
            explanation: 'Doğru! Defansif tasarım anormal şartlardaki direnci ölçer.',
          },
          {
            id: 'e1q3_c',
            text: 'Tüm hata fırlatma (throw error) mekanizmaları sessizce silinmelidir.',
            isCorrect: false,
            explanation: 'Hataları gizlemek çökmeyi görünmez kılar ama felaketi büyütür.',
          },
        ],
      },
      {
        id: 'exam1_q4',
        prompt:
          '4. Soru (Ders 4): Bir fonksiyonu "saf fonksiyon" (pure function) kılan vazgeçilmez şart hangisidir?',
        options: [
          {
            id: 'e1q4_a',
            text: 'Aynı girdiyle her çağrıldığında aynı çıktıyı üretmesi ve dış dünyada yan etki bırakmaması.',
            isCorrect: true,
            explanation: 'Doğru! Saf fonksiyonlar deterministiktir ve global durumu gizlice bozmaz.',
          },
          {
            id: 'e1q4_b',
            text: 'En az 500 satır uzunluğunda olması ve global değişkenleri doğrudan ezmesi.',
            isCorrect: false,
            explanation: 'Bu tam tersine tehlikeli yan etkili kod örneğidir.',
          },
          {
            id: 'e1q4_c',
            text: 'Hiçbir parametre almadan rastgele sayılar döndürmesi.',
            isCorrect: false,
            explanation: 'Rastgelelik saf fonksiyon mantığına aykırıdır.',
          },
        ],
      },
      {
        id: 'exam1_q5',
        prompt:
          '5. Soru (Ders 5): Yapay zeka ile üretilmiş bir SQL sorgusunda enjeksiyon (SQL Injection) açığına karşı en güvenilir savunma nedir?',
        options: [
          {
            id: 'e1q5_a',
            text: 'Kullanıcı metnini doğrudan string concatenation ile sorgu metnine yapıştırmak.',
            isCorrect: false,
            explanation: 'Bu SQL Injection açığının doğrudan sebebidir!',
          },
          {
            id: 'e1q5_b',
            text: 'Parametrik sorgular (Prepared Statements) ve şema doğrulama kullanmak.',
            isCorrect: true,
            explanation: 'Doğru! Parametrik sorgularda veritabanı motoru kullanıcı girdisini komut olarak yorumlamaz.',
          },
          {
            id: 'e1q5_c',
            text: 'Veritabanındaki tüm şifreleri açık metin olarak saklamak.',
            isCorrect: false,
            explanation: 'Ciddi güvenlik ihlalidir.',
          },
        ],
      },
    ],
  },
];

/**
 * Öğrencinin açık uçlu ders cevabını anlamsal ve anahtar kelime bağlamında analiz eder.
 * Anlamsal uygunluk >= %70 ise hoca onaylayıcı ilerler; < %70 ise doğru mantığı özetler.
 */
export function evaluateStudentAnswer(
  studentAnswer: string,
  question: InLectureQuestion,
): {
  score: number;
  isPassed: boolean;
  professorFeedback: string;
} {
  const clean = (studentAnswer || '').toLocaleLowerCase('tr-TR').trim();
  if (!clean || clean.length < 5) {
    return {
      score: 15,
      isPassed: false,
      professorFeedback: `Sanırım yanlış düşünüyorsun; derste bahsettiğimiz üzere bu konunun temel mantığı şöyle olmalı: ${question.correctApproachSummary}`,
    };
  }

  let keywordHits = 0;
  question.expectedKeywords.forEach(kw => {
    if (clean.includes(kw.toLocaleLowerCase('tr-TR'))) {
      keywordHits += 1;
    }
  });

  let semanticHits = 0;
  question.semanticKeywords.forEach(kw => {
    if (clean.includes(kw.toLocaleLowerCase('tr-TR'))) {
      semanticHits += 1;
    }
  });

  let score = keywordHits * 18 + semanticHits * 10;
  if (clean.length >= 20) score += 15;
  if (clean.length >= 50) score += 15;
  if (clean.length >= 80) score += 10;

  const normalizedScore = Math.min(100, Math.max(15, score));
  const isPassed = normalizedScore >= 70;

  let professorFeedback: string;
  if (isPassed) {
    professorFeedback = `${question.successFeedback} (Değerlendirme: %${normalizedScore} Anlamsal Uygunluk)`;
  } else {
    professorFeedback = `Sanırım yanlış düşünüyorsun; derste bahsettiğimiz üzere bu konunun temel mantığı şöyle olmalı: ${question.correctApproachSummary}`;
  }

  return {
    score: normalizedScore,
    isPassed,
    professorFeedback,
  };
}
