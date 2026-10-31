/**
 * Faz 8 — Dört Yıllık Yazılım Mühendisliği Müfredat Şeması (`curriculum.md` G1.1 – G8.2)
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
  // 1. SINIF
  {
    code: 'G1.1',
    academicYear: 1,
    semester: 1,
    semesterLabel: '1. Sınıf Güz',
    title: 'Döngü ve Koşul Düzenleme',
    description: 'Belirtilen şartlara göre temel hesaplama yapan bir fonksiyon yazmak.',
    zombieTrapName: 'Gelişmiş Sözdizimi & Kopyalama Tuzağı',
    zombieTrapDescription:
      'AI derste henüz görülmeyen karmaşık deyimler üretir; öğrenci açıklayamayınca 0 alır.',
    affectedMetrics: ['kod_okuryazarligi', 'ai_denetimi'],
    linkedTaskId: 'task_g1_1_loop_syntax',
  },
  {
    code: 'G1.2',
    academicYear: 1,
    semester: 1,
    semesterLabel: '1. Sınıf Güz',
    title: 'Sınır Değer Testi (Edge Case)',
    description: 'Girilen dizideki en büyük ve en küçük değerleri güvenli bulma.',
    zombieTrapName: 'Happy-Path (Mutlu Yol) Tuzağı',
    zombieTrapDescription:
      'AI boş dizi (`[]`) veya negatif sayılarda çöken kod verir.',
    affectedMetrics: ['hata_ayiklama_sabri', 'ai_denetimi'],
    linkedTaskId: 'task_g1_2_edge_case_rogue',
  },
  {
    code: 'G2.1',
    academicYear: 1,
    semester: 2,
    semesterLabel: '1. Sınıf Bahar',
    title: 'Sınıf ve Kapsülleme (Encapsulation)',
    description: 'Modüler bir banka/cüzdan sınıfı tasarlayıp bakiyeyi korumak.',
    zombieTrapName: 'Public Değişken Kirliliği',
    zombieTrapDescription:
      'AI bakiyeyi `public` tanımlar; dışarıdan bakiye eksiye düşürülür.',
    affectedMetrics: ['sistem_dusuncesi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_g2_1_encapsulation',
  },
  {
    code: 'G2.2',
    academicYear: 1,
    semester: 2,
    semesterLabel: '1. Sınıf Bahar',
    title: 'Kalıtım ve Polimorfizm',
    description: 'Oyuncu karakter tiplerini ortak ata sınıftan türetmek.',
    zombieTrapName: 'Aşırı Soyutlama & Yanılsama Tuzağı',
    zombieTrapDescription:
      'AI gereksiz derin sınıf hiyerarşisi oluşturur; küçük değişiklik tüm karakterleri kilitler.',
    affectedMetrics: ['hata_ayiklama_sabri', 'sistem_dusuncesi'],
  },

  // 2. SINIF
  {
    code: 'G3.1',
    academicYear: 2,
    semester: 3,
    semesterLabel: '2. Sınıf Güz',
    title: 'Bağlı Liste (Linked List) Onarımı',
    description: 'Hatalı çalışan bir bağlı liste düğüm silme fonksiyonunu tamir etmek.',
    zombieTrapName: 'Sonsuz Döngü & Bellek Sızıntısı',
    zombieTrapDescription:
      'AI `next` göstericisini koparan kod üretir; bellek sızar.',
    affectedMetrics: ['hata_ayiklama_sabri', 'kod_okuryazarligi'],
  },
  {
    code: 'G3.2',
    academicYear: 2,
    semester: 3,
    semesterLabel: '2. Sınıf Güz',
    title: 'Arama ve Sıralama Karmaşıklığı',
    description: '100.000 elemanlı listede hızlı arama ve sıralama yapmak.',
    zombieTrapName: 'Zaman Karmaşıklığı O(N²) Tuzağı',
    zombieTrapDescription:
      'AI Bubble Sort içeren kod verir; büyük veride Timeout yaşanır.',
    affectedMetrics: ['sistem_dusuncesi', 'ai_denetimi'],
    linkedTaskId: 'task_g3_2_complexity_timeout',
  },
  {
    code: 'G4.1',
    academicYear: 2,
    semester: 4,
    semesterLabel: '2. Sınıf Bahar',
    title: 'İkili Arama Ağacı (BST) Dengeleme',
    description: 'Verileri dengeli ağaçta saklayıp sorgulama süresini optimize etmek.',
    zombieTrapName: 'Bozuk Dengelenme Tuzağı',
    zombieTrapDescription:
      'AI ağacı tek yönlü bağlı listeye dönüştüren dengesiz ekleme kodu verir.',
    affectedMetrics: ['kod_okuryazarligi', 'ai_denetimi'],
  },
  {
    code: 'G4.2',
    academicYear: 2,
    semester: 4,
    semesterLabel: '2. Sınıf Bahar',
    title: 'Dosya Tabanlı Veri Önbellekleme',
    description: 'Disk üzerindeki JSON dosyalarını belleğe yükleyip indekslemek.',
    zombieTrapName: 'Race Condition / Dosya Kilitlenme',
    zombieTrapDescription:
      'AI eşzamanlı okuma/yazma kontrolü yapmaz; veri bozulur.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },

  // 3. SINIF
  {
    code: 'G5.1',
    academicYear: 3,
    semester: 5,
    semesterLabel: '3. Sınıf Güz',
    title: 'Spaghetti Zombie Kod Restorasyonu',
    description: 'Karmaşık bir Zombie Projesini iş kurallarını bozmadan refactor etmek.',
    zombieTrapName: 'Yeniden Yazma (Rewrite) İllüzyonu',
    zombieTrapDescription:
      'AI "her şeyi baştan yazalım" der ve çalışan gizli iş kurallarını siler.',
    affectedMetrics: ['sistem_dusuncesi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_g5_1_zombie_rewrite_trap',
  },
  {
    code: 'G5.2',
    academicYear: 3,
    semester: 5,
    semesterLabel: '3. Sınıf Güz',
    title: 'Factory / Strategy Deseni Entegrasyonu',
    description: 'Ödeme sistemine yeni ödeme yöntemleri eklemek.',
    zombieTrapName: 'Spaghetti Pattern Entegrasyonu',
    zombieTrapDescription: 'AI devasa if-else yığını ekler; kod katılaşır.',
    affectedMetrics: ['sistem_dusuncesi', 'ai_denetimi'],
  },
  {
    code: 'G6.1',
    academicYear: 3,
    semester: 6,
    semesterLabel: '3. Sınıf Bahar',
    title: 'SQL / NoSQL Sorgu Optimizasyonu',
    description: 'Milyonluk veritabanında yavaş çalışan ilişkisel sorguyu iyileştirmek.',
    zombieTrapName: 'N+1 Sorgu ve İndeks Açığı',
    zombieTrapDescription:
      'AI döngü içinde SQL sorgusu çalıştıran kod verir; sunucu kilitlenir.',
    affectedMetrics: ['kod_okuryazarligi', 'sistem_dusuncesi'],
  },
  {
    code: 'G6.2',
    academicYear: 3,
    semester: 6,
    semesterLabel: '3. Sınıf Bahar',
    title: 'REST API & Servis Bağımlılığı',
    description: 'İki ayrı mikroservis arasında veri senkronizasyonu kurmak.',
    zombieTrapName: 'Sessiz Başarısızlık (Silent Failure)',
    zombieTrapDescription:
      'AI `catch(e) {}` ile hataları yutar; başarısız işlem başarılı görünür.',
    affectedMetrics: ['ai_denetimi', 'hata_ayiklama_sabri'],
  },

  // 4. SINIF
  {
    code: 'G7.1',
    academicYear: 4,
    semester: 7,
    semesterLabel: '4. Sınıf Güz',
    title: 'AI Agent İş Akışı Oluşturma',
    description: '3 farklı AI agentına (Kodlayıcı, Testçi, Dokümantasyoncu) görev dağıtmak.',
    zombieTrapName: 'Sonsuz Döngü & Kota Tüketim Tuzağı',
    zombieTrapDescription:
      'Agentlar birbirinin çıktısını sonsuz döngüde tetikler; API bütçesi biter.',
    affectedMetrics: ['ai_denetimi', 'sistem_dusuncesi'],
    linkedTaskId: 'task_g7_1_agent_loop_guard',
  },
  {
    code: 'G7.2',
    academicYear: 4,
    semester: 7,
    semesterLabel: '4. Sınıf Güz',
    title: 'Yük Dengeleme ve Önbellek (Redis)',
    description: 'Yüksek trafikli anlarda sistemi ayakta tutacak caching katmanı eklemek.',
    zombieTrapName: 'Önbellek Bayatlaması (Stale Cache)',
    zombieTrapDescription:
      'AI bayat veriyi temizlemeyen caching verir; kullanıcılar eski veriyi görür.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },
  {
    code: 'G8.1',
    academicYear: 4,
    semester: 8,
    semesterLabel: '4. Sınıf Bahar',
    title: 'Güvenlik ve Prompt Injection Denetimi',
    description: 'Yayın öncesi uygulamadaki SQL ve AI injection açıklarını denetlemek.',
    zombieTrapName: 'Zayıf Doğrulama & Harici Kod Çalıştırma',
    zombieTrapDescription:
      'AI parametresiz sorgu ve filtresiz prompt kullanır.',
    affectedMetrics: ['ai_denetimi', 'kod_okuryazarligi'],
    linkedTaskId: 'task_legacy_login_audit',
  },
  {
    code: 'G8.2',
    academicYear: 4,
    semester: 8,
    semesterLabel: '4. Sınıf Bahar',
    title: 'Capstone Project: Canlıya Alma ve İzlenebilirlik',
    description: 'Tüm sistemi Cloud Run ortamına taşımak ve izleme kurmak.',
    zombieTrapName: 'Kör Yaygınlaştırma (Blind Deployment)',
    zombieTrapDescription:
      'AI eksik ortam değişkeni ve sağlık kontrolsüz deploy yapılandırması verir.',
    affectedMetrics: ['sistem_dusuncesi', 'hata_ayiklama_sabri'],
  },
];

export function getCurriculumForYear(
  year: 1 | 2 | 3 | 4,
): CurriculumModuleItem[] {
  return FOUR_YEAR_CURRICULUM_ROADMAP.filter(item => item.academicYear === year);
}
