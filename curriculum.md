# Zombie Coder — 4 Yıllık Yazılım Mühendisliği Eğitim Haritası (curriculum.md)

## 1. Genel Bakış ve Oyun Felsefesi
`idea.md`, `mechanics.md`, `plan.md` ve `technic.md` kaynaklarına dayanan bu müfredat belgesi, **Zombie Coder** oyununda oyuncunun (öğrencinin) 4 yıllık üniversite yolculuğu boyunca yazılım mühendisliği yetkinliklerini ve AI ile çalışma disiplinini geliştirmesini hedefler. 

Oyunun temel amacı yalnızca programlama sözdizimini öğretmek değil; **AI tarafından üretilen kodu okuma, anlama, test etme, hata ayıklama, mimari kararlar alma ve AI denetçisi yetkinliği kazanma** süreçlerini simüle etmektir. Personalzy (oyun içi yapay zeka sistemi), oyuncunun eylemlerini ve gün sonu günlüklerini takip ederek metriklerini dinamik olarak değerlendirir.

---

## 2. Personalzy Yetkinlik Ölçüm Metrikleri
Personalzy, oyuncunun görevlerdeki ve gün sonu değerlendirmelerindeki performansına göre 4 temel mühendislik metriğini takip eder ve gizli profili günceller:

| Metrik | Tanım | Ölçüm Kriterleri (Personalzy Gözlemleri) |
| :--- | :--- | :--- |
| **Sistem Düşüncesi** | Kodun tekil parçalarını değil; modüller arası ilişkileri, bağımlılıkları ve mimari bütünlüğü kavrama yetisi. | Modüler yapı kurma, bağımlılık yönetimi, yan etkileri (side-effects) öngörme, mimari kararları gerekçelendirme. |
| **Kod Okuryazarlığı** | Yazılan veya AI tarafından üretilen kodu okuma, anlama, karmaşıklığını analiz etme ve başkalarına ifade edebilme. | AI çıktısını satır satır açıklayabilme, gereksiz karmaşıklığı tespit etme, refactoring yapabilme. |
| **AI Denetimi** | AI'ı bir kör inanç nesnesi değil, bir araç olarak yönlendirme, prompt mühendisliği yapma ve AI çıktılarını doğrulama. | AI koduna doğrudan güvenmeme, açık gereksinim tanımlama, hallucination ve mantık hatalarını yakalama. |
| **Hata Ayıklama Sabrı** | Karşılaşılan bug'larda paniklemeden adım adım iz sürme, test senaryoları yazma ve kök nedeni bulma direnci. | Debugger kullanımı, log takibi, pes etmeden farklı hipotezleri test etme, sınır durumlarını (edge cases) deneme. |

---

## 3. Dört Yıllık Eğitim Haritası ve Zombie Trap Senaryoları

### 1. SINIF: Sözdizimi ve Ezber Tuzağı
**Ana Tema:** Temel algoritmik düşünce, değişkenler, kontrol yapıları ve AI çıktısını körü körüne kopyalama eğilimine karşı koyma.

#### Dönem 1 (Güz) — Algoritmalara Giriş ve Sözdizimi
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G1.1: Döngü ve Koşul Düzenleme** | Belirtilen şartlara göre temel hesaplama yapan bir fonksiyon yazmak. | **Gelişmiş Sözdizimi & Kopyalama Tuzağı:** AI, derste henüz görülmeyen lambda/pointer veya farklı dilden deyimler üretir. Öğrenci kodu doğrudan yapıştırır ama sınavda hoca karşısında kodu açıklayamayınca 0 alır. | Kod Okuryazarlığı ↓<br>AI Denetimi ↓ |
| **G1.2: Sınır Değer Testi (Edge Case)** | Girilen sayı dizisindeki en büyük ve en küçük değerleri bulma. | **Happy-Path (Mutlu Yol) Tuzağı:** AI boş dizi (`[]`) veya negatif sayılarda çöken bir kod verir. Öğrenci test etmeden ödevi teslim eder, otomatik otomasyon testinde sistem çöker. | Hata Ayıklama Sabrı ↓<br>AI Denetimi ↓ |

#### Dönem 2 (Bahar) — Nesne Yönelimli Programlamaya Geçiş
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G2.1: Sınıf ve Kapsülleme (Encapsulation)** | Modüler bir banka hesabı sınıfı tasarlayıp bakiyeyi korumak. | **Public Değişken Kirliliği:** AI bakiyeyi `public` tanımlar. Dışarıdan bakiye eksiye düşürülür; öğrenci kapsülleme ilkesi ihlalini fark edemez. | Sistem Düşüncesi ↓<br>Kod Okuryazarlığı ↓ |
| **G2.2: Kalıtım ve Polimorfizm** | Oyuncu karakter tiplerini (Savaşçı, Büyücü) ortak ata sınıftan türetmek. | **Aşırı Soyutlama & Yanılsama Tuzağı:** AI gereksiz yere derin sınıf hiyerarşisi oluşturur. Koddaki küçük bir değişiklik tüm karakterlerin kilitlenmesine yol açar. | Hata Ayıklama Sabrı ↓<br>Sistem Düşüncesi ↓ |

---

### 2. SINIF: Veri Yapıları ve İlk AI Bağımlılığı
**Ana Tema:** Zaman/Alan karmaşıklığı ($O(n)$), bellek yönetimi ve AI'ın ürettiği algoritmaların performans açıklarını fark etme.

#### Dönem 3 (Güz) — Veri Yapıları ve Algoritmalar
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G3.1: Bağlı Liste (Linked List) Onarımı** | Hatalı çalışan bir bağlı liste düğüm silme fonksiyonunu tamir etmek. | **Sonsuz Döngü & Bellek Sızıntısı:** AI, `next` göstericisini koparan kod üretir. Büyük veri setinde bellek sızar, oyun kilitlenir. | Hata Ayıklama Sabrı ↓<br>Kod Okuryazarlığı ↓ |
| **G3.2: Arama ve Sıralama Karmaşıklığı** | 100.000 elemanlı listede hızlı arama yapmak ($O(n \log n)$ beklentisi). | **Zaman Karmaşıklığı ($O(N^2)$) Tuzağı:** AI `Bubble Sort` içeren kod verir. Küçük testte çalışan kod, canlı değerlendirmede zaman aşımına (Timeout) uğrar. | Sistem Düşüncesi ↓<br>AI Denetimi ↓ |

#### Dönem 4 (Bahar) — Gelişmiş Veri Yapıları ve Dosya Sistemleri
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G4.1: İkili Arama Ağacı (BST) Dengeleme** | Verileri dengeli ağaçta saklayıp sorgulama süresini optimize etmek. | **Bozuk Dengelenme Tuzağı:** AI ağacı tek yönlü bağlı listeye dönüştüren dengesiz ekleme kodu verir. Sorgular yavaşlar, öğrenci algoritmayı sorgulamaz. | Kod Okuryazarlığı ↓<br>AI Denetimi ↓ |
| **G4.2: Dosya tabanlı Veri Önbellekleme** | Disk üzerindeki JSON dosyalarını belleğe yükleyip indexlemek. | **Race Condition / Dosya Kilitlenme:** AI eşzamanlı dosya okuma/yazma kontrolü yapmaz; veri bozulur ve dosya kilitlenir. | Sistem Düşüncesi ↓<br>Hata Ayıklama Sabrı ↓ |

---

### 3. SINIF: Mimari ve Zombie Kod Krizleri
**Ana Tema:** Legacy (zombie) kod tabanlarını devralma, teknik borç yönetimi, tasarım desenleri ve AI'ın yarattığı karmaşayı temizleme.

#### Dönem 5 (Güz) — Yazılım Mimarisi ve Tasarım Desenleri
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G5.1: Spaghetti Zombie Kod Restorasyonu** | 2000 satırlık spagetti bir Zombie Projesini refactor etmek. | **Yeniden Yazma (Rewrite) İllüzyonu:** AI "her şeyi baştan yazalım" der ve çalışan gizli iş kurallarını uydurarak siler. Sistem tüm eski işlevselliğini kaybeder. | Sistem Düşüncesi ↓<br>Kod Okuryazarlığı ↓ |
| **G5.2: Factory / Strategy Deseni Entegrasyonu** | Ödeme sistemine yeni ödeme yöntemleri eklemek. | **Spaghetti Pattern Entegrasyonu:** AI `if-else` yığını ekler. Kod katılaşır (rigidity), yeni modül eklemek imkansız hale gelir. | Sistem Düşüncesi ↓<br>AI Denetimi ↓ |

#### Dönem 6 (Bahar) — Veritabanı Sistemleri ve Mikromimariler
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G6.1: SQL / NoSQL Sorgu Optimizasyonu** | Milyonluk veritabanında yavaş çalışan ilişkisel sorguyu iyileştirmek. | **N+1 Sorgu ve İndeks Açığı:** AI döngü içinde SQL sorgusu çalıştıran kod verir. Veritabanı sunucusu kilitlenir ve çöker. | Kod Okuryazarlığı ↓<br>Sistem Düşüncesi ↓ |
| **G6.2: Rest API & Servis Bağımlılığı** | İki ayrı mikroservis arasında veri senkronizasyonu kurmak. | **Sessiz Başarısızlık (Silent Failure):** AI `try-catch` bloklarında hataları yutar (`catch(e) {}`). İstek başarısız olur ama sistem "başarılı" döner. | AI Denetimi ↓<br>Hata Ayıklama Sabrı ↓ |

---

### 4. SINIF: Sistem Tasarımı ve AI Denetçisi Yetkinliği
**Ana Tema:** Dağıtık sistemler, yüksek erişilebilirlik, AI Agent orkestrasyonu, güvenlik denetimi ve teknik liderlik.

#### Dönem 7 (Güz) — Dağıtık Sistemler ve AI Agent Orkestrasyonu
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G7.1: AI Agent İş Akışı Oluşturma** | 3 farklı AI agent'ına (Kodlayıcı, Testçi, Dokümantasyoncu) görev dağıtmak. | **Sonsuz Döngü & Kota Tüketim Tuzağı:** Agent'lar birbirinin hatasını düzelteyim derken sonsuz paslaşma döngüsüne girer; API kotasını ve bütçeyi bitirir. | AI Denetimi ↓<br>Sistem Düşüncesi ↓ |
| **G7.2: Yük Dengeleme ve Önbellek (Redis)** | Yüksek trafikli anlarda sistemi ayakta tutacak caching katmanı eklemek. | **Önbellek Bayatlaması (Stale Cache):** AI bayat veriyi güncellemeyen caching verir. Kullanıcılar eski/yanlış verileri görür. | Sistem Düşüncesi ↓<br>Hata Ayıklama Sabrı ↓ |

#### Dönem 8 (Bahar) — Bitirme Projesi ve Güvenlik Denetçiliği
| Ders Görevi | Görev Açıklaması | Zombie Trap (AI Kör Güven Senaryosu) | Etkilenen Metrik |
| :--- | :--- | :--- | :--- |
| **G8.1: Güvenlik ve Prompt Injection Denetimi** | Yayın öncesi uygulamadaki güvenlik açıklarını ve AI injection risklerini denetlemek. | **Zayıf Doğrulama & Harici Kod Çalıştırma:** AI girdileri sanitize etmeyen regex verir. Saldırgan veritabanını siler veya zararlı komut çalıştırır. | AI Denetimi ↓<br>Kod Okuryazarlığı ↓ |
| **G8.2: Capstone Project: Canlıya Alma ve İzlenebilirlik** | Tüm 4 yıllık sistemi canlı ortama (Cloud Run/Kubernetes) taşımak ve monitoring kurmak. | **Kör Yaygınlaştırma (Blind Deployment):** AI eksik ortam değişkeni (ENV) içeren deployment dosyası verir. Sistem crash-loop'a girer ve ayağa kalkmaz. | Sistem Düşüncesi ↓<br>Hata Ayıklama Sabrı ↓ |

---

## 4. Personalzy Değerlendirme ve İyileştirme Döngüsü
Oyuncu bir Zombie Trap senaryosuna düştüğünde Personalzy süreci şu şekilde yönetir:

1. **Yargılamayan Geri Bildirim:** Oyuncu cezalandırılmaz; bunun yerine gün sonu günlüğünde soru sorulur (*"Bugün kodun hangi kısmını anlamakta zorlandın?"*).
2. **Kişiselleştirilmiş Mikro-Görevler:** İlgili metrik düştüğünde sonraki gün oyuncunun karşısına "Kod Okuma" veya "Sınır Durumu Test Etme" odaklı iyileştirme görevleri çıkarılır.
3. **Tercih Dosyası Güncellemesi (`design.md` / `rules.md`):** AI ile çalışma kurallarına onaylı yeni maddeler eklenir (Örn: *"AI önceden hazırlanan test senaryolarını geçmeden kod kabul edilemez"*).
