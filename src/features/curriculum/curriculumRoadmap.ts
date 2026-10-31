/**
 * Faz 8 — Güncellenmiş 4 Yıllık Müfredat Şeması (`curriculum.md` G1.1 – G8.2)
 * Kodlama sözdizimi yerine:
 * 1) Algoritma, Yazılımın Temelleri, Veri Yapıları ve Sistem Mimarileri (Prof. Demir - Üniversite)
 * 2) Ürün Planlama, Agile Yol Haritası (Roadmap) ve Pazarlama Stratejisi (Kaan - Üniversite)
 * 3) Satış Stratejisi, Müşteri İknası ve Gelir Modeli (Koç Burak - Spor Salonu)
 */

import { EngineeringMetricKey } from '../tasks/taskCatalog';

export interface CurriculumModuleItem {
  code: string;
  academicYear: 1 | 2 | 3 | 4;
  semester: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  semesterLabel: string;
  title: string;
  description: string;
  zombieTrapName: string;
  zombieTrapDescription: string;
  affectedMetrics: EngineeringMetricKey[];
  linkedTaskId?: string;
}

export const FOUR_YEAR_CURRICULUM_ROADMAP: CurriculumModuleItem[] = [
  // 1. SINIF — YAZILIMIN TEMELLERİ, ALGORİTMİK DÜŞÜNCE & MVP PLANLAMA
  {
    code: 'G1.1',
    academicYear: 1,
    semester: 1,
    semesterLabel: '1. Sınıf Güz',
    title: 'Algoritmik Düşünce ve Akış Tasarımı',
    description:
      'Problemi kodlamadan önce karar ağacı, akış diyagramı ve sınır koşullarıyla modellemek.',
    zombieTrapName: 'Plansız Akış & Ezber Çözüm Tuzağı',
    zombieTrapDescription:
      'Problemin kök nedenini ve sınır durumlarını anlamadan hazır şablon uygulamak.',
    affectedMetrics: ['kod_okuryazarligi', 'ai_denetimi'],
    linkedTaskId: 'task_g1_1_loop_syntax',
  },
  {
    code: 'G1.2',
    academicYear: 1,
    semester: 1,
    semesterLabel: '1. Sınıf Güz',
    title: 'Ürün Planlama, MVP Kapsamı ve Hedef Kitle',
    description:
      'Kaan ile projenin çekirdek değer önerisini (MVP) belirlemek ve gereksiz özellik şişmesini önlemek.',
    zombieTrapName: 'Özellik Şişmesi (Feature Creep) Tuzağı',
    zombieTrapDescription:
      'Kullanıcı doğrulaması yapmadan 20 özelliği aynı anda planlayıp lansmanı aylarca geciktirmek.',
    affectedMetrics: ['hata_ayiklama_sabri', 'ai_denetimi'],
    linkedTaskId: 'task_g1_2_edge_case_rogue',
  },
  {
    code: 'G2.1',
    academicYear: 1,
    semester: 2,
    semesterLabel: '1. Sınıf Bahar',
    title: 'Yazılımın Temelleri: Modülerlik ve Sorumluluk Ayrımı',
    description:
      'Sistem bileşenlerinin sınırlarını çizmek, veri gizliliğini ve modüller arası bağımsızlığı korumak.',
    zombieTrapName: 'Merkezi Bağımlılık & Sınır İhlali',
    zombieTrapDescription:
      'Tüm modüllerin birbirinin verisine doğrudan eriştiği kırılgan bir yapı kurmak.',
    affectedMetrics: ['sistem_dusuncesi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_g2_1_encapsulation',
  },
  {
    code: 'G2.2',
    academicYear: 1,
    semester: 2,
    semesterLabel: '1. Sınıf Bahar',
    title: 'Kullanıcı Hikayeleri ve Pazar Konumlandırma',
    description:
      'Ürünün kim için hangi problemi çözdüğünü netleştirmek ve ilk kullanıcı geri bildirim döngüsünü kurmak.',
    zombieTrapName: 'Hayali Kullanıcı Tuzağı',
    zombieTrapDescription:
      'Gerçek kullanıcılarla hiç konuşmadan varsayımlarla ürün stratejisi belirlemek.',
    affectedMetrics: ['hata_ayiklama_sabri', 'sistem_dusuncesi'],
  },

  // 2. SINIF — VERİ YAPILARI, KARMAŞIKLIK ANALİZİ & SATIŞ PSİKOLOJİSİ
  {
    code: 'G3.1',
    academicYear: 2,
    semester: 3,
    semesterLabel: '2. Sınıf Güz',
    title: 'Veri Yapıları: Kuyruk (Queue), Yığın (Stack) ve Bağlı Yapılar',
    description:
      'Gerçek zamanlı görev sıralaması ve bellek yönetiminde doğru veri yapısını seçmek.',
    zombieTrapName: 'Yanlış Veri Modeli & Darboğaz',
    zombieTrapDescription:
      'Sıralı işleme gerektiren akışta rastgele erişimli hantal yapılar kullanarak sistemi kilitlemek.',
    affectedMetrics: ['hata_ayiklama_sabri', 'kod_okuryazarligi'],
  },
  {
    code: 'G3.2',
    academicYear: 2,
    semester: 3,
    semesterLabel: '2. Sınıf Güz',
    title: 'Hash Tabloları, Ağaçlar ve Ölçeklenebilir Arama Algoritmaları',
    description:
      '100.000+ kullanıcı verisinde O(1) ve O(log N) erişim sağlayan veri yapısı mimarisi kurmak.',
    zombieTrapName: 'O(N²) Ölçeklenme Çöküşü',
    zombieTrapDescription:
      'Küçük test verisinde çalışan doğrusal taramayı milyonluk trafiğe çıkarıp sistemi çökertmek.',
    affectedMetrics: ['sistem_dusuncesi', 'ai_denetimi'],
    linkedTaskId: 'task_g3_2_complexity_timeout',
  },
  {
    code: 'G4.1',
    academicYear: 2,
    semester: 4,
    semesterLabel: '2. Sınıf Bahar',
    title: 'Dengeli Ağaçlar (Tree) ve Graf (Graph) Algoritmaları',
    description:
      'Sosyal ağ ve öneri sistemlerinde ilişkisel verileri graf ve ağaç yapılarıyla modellemek.',
    zombieTrapName: 'Dengesiz Hiyerarşi Tuzağı',
    zombieTrapDescription:
      'İndeksleme ve ağaç dengesini kurmadan derin aramalarla gecikmeyi katlamak.',
    affectedMetrics: ['kod_okuryazarligi', 'ai_denetimi'],
  },
  {
    code: 'G4.2',
    academicYear: 2,
    semester: 4,
    semesterLabel: '2. Sınıf Bahar',
    title: 'Değer Odaklı Satış ve Müşteri İtiraz Yönetimi',
    description:
      'Koç Burak ile ürünün teknik özelliklerini değil, müşteriye kazandırdığı zaman ve geliri (ROI) satmak.',
    zombieTrapName: 'Erken İndirim & Özellik Boğulması',
    zombieTrapDescription:
      'Müşteri ilk fiyat itirazında bulunduğunda değeri anlatmak yerine panikle fiyatı yarıya indirmek.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },

  // 3. SINIF — YAZILIM MİMARİLERİ, YOL HARİTASI & BÜYÜME STRATEJİSİ
  {
    code: 'G5.1',
    academicYear: 3,
    semester: 5,
    semesterLabel: '3. Sınıf Güz',
    title: 'Agile Yol Haritası (Roadmap) ve Miras Sistem Dönüşümü',
    description:
      'Kaan ile çalışan iş kurallarını ve mevcut müşterileri kaybetmeden aşamalı ürün geçişi planlamak.',
    zombieTrapName: 'Her Şeyi Yıkıp Baştan Yapma İllüzyonu',
    zombieTrapDescription:
      'Mevcut müşteri ihtiyaçlarını göz ardı edip aylarca sürecek tam yeniden yazıma girmek.',
    affectedMetrics: ['sistem_dusuncesi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_g5_1_zombie_rewrite_trap',
  },
  {
    code: 'G5.2',
    academicYear: 3,
    semester: 5,
    semesterLabel: '3. Sınıf Güz',
    title: 'Tasarım Desenleri ve Genişletilebilir Mimari',
    description:
      'Farklı ödeme ve abonelik modellerini mevcut sistemi bozmadan tak-çalıştır mimariyle eklemek.',
    zombieTrapName: 'Katı Mimari (Rigid Architecture) Tuzağı',
    zombieTrapDescription:
      'Her yeni müşteri talebinde tüm çekirdek sistemi baştan değiştirmek zorunda kalmak.',
    affectedMetrics: ['sistem_dusuncesi', 'ai_denetimi'],
  },
  {
    code: 'G6.1',
    academicYear: 3,
    semester: 6,
    semesterLabel: '3. Sınıf Bahar',
    title: 'Veritabanı Mimarisi, İndeksleme ve Veri Modelleme',
    description:
      'Yüksek hacimli analitik ve operasyonel verileri doğru şema ve indeks stratejisiyle tasarlamak.',
    zombieTrapName: 'Darboğaz Sorgu Mimarisi',
    zombieTrapDescription:
      'İndeks ve önbellek katmanı olmadan her ekranda milyonlarca satırı tekrar taramak.',
    affectedMetrics: ['kod_okuryazarligi', 'sistem_dusuncesi'],
  },
  {
    code: 'G6.2',
    academicYear: 3,
    semester: 6,
    semesterLabel: '3. Sınıf Bahar',
    title: 'Pazara Giriş (Go-To-Market) ve Ürün Odaklı Büyüme (PLG)',
    description:
      'Pazarlama hunisi, kullanıcı edinme maliyeti (CAC) ve organik büyüme döngülerini kurgulamak.',
    zombieTrapName: 'Plansız Lansman Tuzağı',
    zombieTrapDescription:
      'Hedef kitle ve dağıtım kanalı belirlemeden ürünü yayınlayıp kendi kendine satılmasını beklemek.',
    affectedMetrics: ['ai_denetimi', 'hata_ayiklama_sabri'],
  },

  // 4. SINIF — DAĞITIK SİSTEM MİMARİSİ, B2B SATIŞ & YATIRIMCI SUNUMU
  {
    code: 'G7.1',
    academicYear: 4,
    semester: 7,
    semesterLabel: '4. Sınıf Güz',
    title: 'B2B Satış Stratejisi, Fiyatlandırma ve Büyüme Orkestrasyonu',
    description:
      'Koç Burak ve Kaan ile kurumsal satış hunisi, kademeli fiyatlandırma ve kaynak bütçesi yönetimi.',
    zombieTrapName: 'Kontrolsüz Maliyet & Kârsız Satış Tuzağı',
    zombieTrapDescription:
      'Birim ekonomisini (Unit Economics) hesaplamadan sınırsız kaynak tüketen paketler satmak.',
    affectedMetrics: ['ai_denetimi', 'sistem_dusuncesi'],
    linkedTaskId: 'task_g7_1_agent_loop_guard',
  },
  {
    code: 'G7.2',
    academicYear: 4,
    semester: 7,
    semesterLabel: '4. Sınıf Güz',
    title: 'Yük Dengeleme, Önbellek (Caching) ve Dağıtık Mimari',
    description:
      'Küresel ölçekte binlerce eşzamanlı kullanıcıyı kesintisiz karşılayan dağıtık mimari tasarlamak.',
    zombieTrapName: 'Tek Nokta Hata (Single Point of Failure) Tuzağı',
    zombieTrapDescription:
      'Yedeklilik ve önbellek geçersizleştirme stratejisi kurmadan canlı trafiğe çıkmak.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },
  {
    code: 'G8.1',
    academicYear: 4,
    semester: 8,
    semesterLabel: '4. Sınıf Bahar',
    title: 'Sıfır Güven (Zero-Trust) Sistem Mimarisi ve Güvenlik',
    description:
      'Kurumsal müşteriler için veri güvenliği, yetkilendirme katmanları ve dayanıklı API mimarisi kurmak.',
    zombieTrapName: 'Doğrulanmamış Katman Tuzağı',
    zombieTrapDescription:
      'İstemciden gelen veriyi sınır katmanında doğrulamadan doğrudan çekirdek sisteme iletmek.',
    affectedMetrics: ['ai_denetimi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_legacy_login_audit',
  },
  {
    code: 'G8.2',
    academicYear: 4,
    semester: 8,
    semesterLabel: '4. Sınıf Bahar',
    title: 'Capstone: Ürün Lansmanı, Yatırımcı Sunumu ve Ölçekleme',
    description:
      'Mimariyi, ürün yol haritasını ve satış stratejisini birleştirerek tam kapsamlı girişim sunumu yapmak.',
    zombieTrapName: 'Vizyonsuz Teslimat Tuzağı',
    zombieTrapDescription:
      'Sadece teknik altyapıyı anlatıp iş modelini, pazarlama planını ve müşteri değerini göz ardı etmek.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },
];

export function getCurriculumForYear(
  year: 1 | 2 | 3 | 4,
): CurriculumModuleItem[] {
  return FOUR_YEAR_CURRICULUM_ROADMAP.filter(item => item.academicYear === year);
}
