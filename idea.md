# Zombie Coder — Oyun Fikirleri

> **Belge amacı:** Bu dosya, Zombie Coder için şimdiye kadar ortaya çıkan fikirleri ve tasarım kararlarını bir araya getiren yaşayan bir fikir belgesidir. Kesinleşmemiş ayrıntılar açıkça belirtilmiştir. Yeni fikirler geldikçe bu belge güncellenebilir.

## 1. Proje özeti

**Zombie Coder**, yazılım mühendisliği öğrencisinin üniversite hayatını, kişisel gelişimini ve yazılım geliştirme sürecini bir araya getiren 2D, yaşam simülasyonu ve yazılım geliştirme temalı bir oyundur.

Oyuncu üniversiteye yeni başlayan bir karakteri yönetir. Üniversiteye gider, derslere ve sınavlara katılır, evine döner, bilgisayarında ödevlerini ve kişisel projelerini geliştirir, sosyal aktivitelere katılır ve günün sonunda yaşadıklarını değerlendirir.

Oyunun ayırt edici özelliği, oyuncunun bilgisayar ortamında verdiği kararların zaman içinde oyun dünyasındaki hayatına yansımasıdır. Oyuncunun tercihleri, çalışma biçimi, geliştirdiği projeler ve günlük değerlendirmeleri oyunun ilerleyişini kişiselleştirir.

Oyun yalnızca kod yazmayı öğretmeye odaklanmaz. Özellikle AI tarafından üretilen kodu **okuma, anlama, inceleme, test etme, hata ayıklama ve mühendislik kararları verme** becerilerini ön plana çıkarır.

## 2. Temel tasarım ilkeleri

- **Ortak başlangıç, kişiye özgü gelişim:** Her oyuncu aynı temel dünya, hikâye formatı ve başlangıç görevleriyle başlar.
- **Dijital eylemlerin gerçek dünya sonuçları:** Oyuncunun bilgisayarda yaptığı seçimler akademik hayatını, ilişkilerini, motivasyonunu ve ileride karşılaşacağı fırsatları etkileyebilir.
- **Kod yazmaktan fazlası:** Kod okuma, sistemleri anlama, AI çıktısını değerlendirme, test etme ve doğru karar verme önemlidir.
- **Oyuncuyu yargılamayan AI:** Hata yapmak veya zorlanmak başarısızlık etiketi değildir. Bunlar yeni öğrenme fırsatları oluşturabilir.
- **Kişisel dijital çalışma alanı:** Oyuncunun bilgisayarı ve projeleri oyun ilerledikçe kendine özgü hâle gelir.
- **Eski yazılım her zaman kötü değildir:** Zombie görevlerinde eski veya karmaşık sistemler bulunabilir. Oyuncunun amacı her zaman sistemi baştan yazmak değil; onu anlamak, riskleri değerlendirmek ve uygun çözümü seçmektir.
- **Oyuncu tercihleri kesin varsayılmamalıdır:** AI, oyuncunun açıkça belirtmediği tercihleri kesinleşmiş gerçekler olarak kaydetmemelidir.

## 3. Oyunun temel yapısı

### 3.1. Giriş ve oyuncu profili

Giriş katmanında oyuncu karakterini oluşturur ve temel bilgilerini girer.

Olası bilgiler:
- Karakter adı veya takma ad
- Başlangıç yazılım bilgisi ve deneyim seviyesi
- İlgi alanları
- Kişisel hedefler

Profil, oyunun başlangıç deneyimini kişiselleştirmeye yardımcı olur. Gereksiz kişisel bilgiler istenmemelidir; örneğin telefon numarası gibi bilgiler ilk sürüm için gerekli değildir.

### 3.2. Ana oyun ekranı

Oyun dünyası, oyuncunun hareket edebildiği 2D bir ortamdır. Başlangıçta temel mekânlar bütün oyuncularda aynıdır.

#### Üniversite
- Yazılım eğitiminin gerçekleştiği ana mekân.
- Dersler, quizler, sınavlar, dönem projeleri ve öğretim görevlileri bulunur.
- Akademik performans ve verilen görevler oyuncunun seçimlerinden etkilenebilir.

#### Ev
Oyuncunun gününü planladığı ve sonlandırdığı ana kontrol noktasıdır.

**Yatak odası**
- Oyuncu yatağa giderek günü bitirir.
- Gün sonu değerlendirmesi başlatılır.
- Değerlendirme tamamlandığında yeni oyun gününe geçilir.

**Çalışma odası**
- Oyuncunun bilgisayarı burada bulunur.
- Üniversite ödevleri, kişisel projeler, ek görevler ve oyun içi yazılım çalışmaları bilgisayardan yürütülür.

#### Spor salonu
- Fiziksel aktivite ve günlük yaşam dengesini temsil eder.
- Enerji, motivasyon ve sosyal ilişkiler üzerinde etkileri olabilir.
- Spor eğitmenleri ve spor salonundaki arkadaşlar oyuncuyla etkileşime girer.

#### Diğer sosyal ve aktivite alanları
- Arkadaşlarla buluşma, etkinlikler ve yeni karakterlerle tanışma için kullanılabilir.
- Yeni mekânlar oyun ilerledikçe açılabilir.

## 4. Günlük oyun döngüsü

Oyun günleri aşağıdaki genel akışa dayanır:

1. **Güne başlama:** Oyuncu uyanır, programını ve bekleyen görevlerini görür.
2. **Gündüz aktiviteleri:** Üniversiteye gider, derslere katılır, sınav veya quiz çözer ya da sosyal aktivitelere katılır.
3. **Serbest zaman:** Oyuncu spor salonuna gidebilir, arkadaşlarıyla vakit geçirebilir veya başka aktiviteler yapabilir.
4. **Bilgisayar zamanı:** Evdeki çalışma odasında ödevler üzerinde çalışır, kişisel projeler geliştirir veya ek görevleri tamamlar.
5. **Gün sonu:** Oyuncu yatağa gider ve kısa günlük sorularını yanıtlar. İsterse AI ile serbest sohbet eder.
6. **Günün değerlendirilmesi:** Günlük yanıtları ve gün içindeki olaylar değerlendirilir; oyun dünyası bir sonraki güne hazırlanır.

Oyuncunun bütün aktiviteleri her gün yapması beklenmemelidir. Zaman ve enerji sınırlı kaynaklar olabilir; bir aktiviteye ayrılan zaman başka bir aktivite için kalan zamanı azaltabilir.

## 5. Bilgisayar ve dijital dünya

Bilgisayar, yalnızca görev listesinin gösterildiği bir ekran değildir. Oyuncunun yazılım geliştirme dünyası ve kişisel çalışma alanıdır.

Önerilen ana bölümler:

### University
- Ders ödevleri
- Quiz ve sınav hazırlıkları
- Dönem projeleri
- Öğretim görevlilerinden gelen görevler

### My Projects
- Oyuncunun kendi oluşturduğu uygulamalar ve oyunlar
- Zamanla gelişen proje dosyaları
- Oyuncunun verdiği tasarım ve teknik kararlar

### AI Memory
- Oyuncunun doğruladığı tercihleri
- Çalışma yaklaşımı ve öğrenme hedefleri
- Proje bağlamı ve önemli kararlar
- Henüz doğrulanmamış veya açıklığa kavuşmamış noktalar

### Zombie Projects
- Eski veya yarım bırakılmış kod tabanları
- Açıklaması eksik sistemler ve bağımlılıklar
- Gizli hatalar ve teknik borç
- Oyuncunun inceleyip düzeltmesi veya yeniden yapılandırması gereken projeler

Bu klasör isimleri şimdilik kavramsaldır; nihai arayüzde değiştirilebilir.

## 6. Görev türleri

### 6.1. Üniversite ödevleri
Derslerle bağlantılı, akademik ilerlemeyi etkileyen görevlerdir. Oyuncunun belirli öğrenme hedeflerine ulaşması beklenir.

### 6.2. Kişisel proje görevleri
Oyuncunun kendi fikirlerini hayata geçirmesine olanak tanır. Bu görevler, yazılım üretme ve ürün geliştirme sürecini deneyimletir.

### 6.3. Zombie görevleri
Oyuncuya eski, yarım kalmış, karmaşık veya hatalar içeren bir yazılım verilebilir. Oyuncunun amacı:
- Mevcut kodu anlamak
- Hatanın kaynağını araştırmak
- Bağımlılıkları ve sistem davranışını incelemek
- Testler yapmak
- Düzeltme, yeniden yapılandırma veya sistemi olduğu gibi koruma seçeneklerini değerlendirmek

Eski kodun otomatik olarak kötü olduğu varsayılmamalıdır. Oyuncu, kararını sistemin işlevine, risklerine ve gereksinimlerine göre vermelidir.

### 6.4. AI ile çalışma görevleri
Oyuncu AI'dan kod üretebilir, tasarım önerileri isteyebilir veya bir problemi çözmesini talep edebilir. Ancak yalnızca AI çıktısını kabul etmek her zaman en iyi sonuç olmamalıdır.

Görevler oyuncuyu şunlara teşvik edebilir:
- Gereksinimleri açıkça ifade etmek
- AI'ın ürettiği kodu okumak
- Çıktıyı test etmek
- Hataları ve güvenlik risklerini incelemek
- AI önerilerini sorgulamak
- Önemli teknik kararları gerekçelendirmek

## 7. Serbest proje geliştirme ve oyun içinde oyun

Yan görevler arasında oyuncudan kendi mini oyununu veya uygulamasını geliştirmesi istenebilir. Görev, oyuncuya temel kriterleri verir; tasarımın ayrıntıları ve çözüm yolu mümkün olduğunca oyuncuya bırakılır.

Örnekler:

### Mini platform oyunu — başlangıç seviyesi
Temel kriterler:
- Oyuncu karakteri hareket edebilmeli.
- En az bir engel bulunmalı.
- Çarpışma kontrolü yapılmalı.
- Kazanma veya kaybetme durumu olmalı.

Oyuncu görsel stili, kontrolleri ve ek özellikleri kendisi seçebilir.

### Hazine avı — orta seviye
Temel kriterler:
- Bir harita üzerinde hareket
- Toplanabilir nesneler
- Basit envanter sistemi
- Skor veya ilerleme takibi

Bu görev, birden fazla sistemin birlikte çalışmasını anlamaya yardımcı olur.

### Zombie kodunu kurtar — ileri seviye
Oyuncuya hatalar içeren, yarım kalmış bir mini oyun verilir. Amaç her şeyi baştan yazmak değil; mevcut kodu anlamak, sorunları bulmak ve uygun bir çözüm üretmektir.

Serbest proje görevlerinin kriterleri net olmalı; ancak oyuncunun ürünü nasıl tasarlayacağı konusunda gereksiz kısıtlamalar getirilmemelidir. Oyuncunun ürettiği projeler, bilgisayarındaki kişisel proje alanını zamanla farklılaştırır.

## 8. Oyuncu gelişimi

Gelişim iki katmanda takip edilir.

### 8.1. Görünür istatistikler

Oyuncu kendi gelişimini oyun arayüzünde görebilir. Önerilen istatistikler:
- Kod okuma
- Sistem düşüncesi
- Problem çözme
- Motivasyon
- Fiziksel enerji
- Sosyal bağlar

Bunlar örnek kategorilerdir; başlangıç değerleri ve hesaplama yöntemi henüz belirlenmemiştir.

İstatistikler yalnızca görevleri bitirip bitirmemeye göre değişmemelidir. Oyuncunun ne öğrendiği, nasıl çalıştığı, dinlenmesi ve diğer yaşam aktiviteleri de dikkate alınabilir.

### 8.2. Gizli AI profili

AI, oyuncunun davranışlarını ve kendi ifadelerini zaman içinde değerlendirerek daha uygun görevler ve geri bildirimler sunabilir.

Takip edilebilecek örnek sinyaller:
- AI çıktısını sorgulama veya doğrudan kabul etme eğilimi
- Hataları araştırma biçimi
- Bir problem karşısında izlediği adımlar
- Hangi açıklama veya öğrenme yöntemlerinin faydalı olduğu
- Oyuncunun açıkça ifade ettiği hedefler ve zorlandığı konular

AI, bu gözlemlerden kesin kişilik yargıları çıkarmamalıdır. Çıkarımlar geçici olmalı, yeni davranışlarla güncellenebilmeli ve oyuncunun ifadeleriyle çeliştiğinde dikkatli ele alınmalıdır.

## 9. Gün sonu günlüğü

Gün sonunda oyuncu yatağa gider. Günün olayları değerlendirildikten sonra kısa sorular sorulur ve oyuncuya isterse serbestçe anlatma alanı sunulur.

Örnek sorular:
1. Bugün kendinle ilgili ne fark ettin?
2. Bugün nasıl hissettin?
3. Yarın neyi farklı yapmak istersin?
4. İstersen bugün aklında kalan başka bir şeyi anlatabilirsin.

Sorular ve yanıt seçenekleri günün olaylarına göre değişebilir. Her gün aynı uzun konuşmanın yapılması zorunlu değildir.

### Günlük yanıtlarının kullanımı

Günlük, tek başına oyuncunun kişiliğini belirlemek için kullanılmaz. AI şu kaynakları birlikte değerlendirebilir:
- Oyuncunun günlük yanıtları
- Gün içinde tamamlanan veya yarım bırakılan görevler
- Bilgisayardaki proje değişiklikleri
- Oyuncunun verdiği kararlar
- Oyun dünyasındaki somut olaylar

Bu sayede AI, oyuncunun yalnızca kendisini nasıl hissettiğini değil, o gün neler yaptığını da dikkate alabilir.

### Örnek olay

Oyuncu günlüğünde AI yardımıyla ödev yapmaya çalıştığını ama buton tasarımlarının istediği gibi olmadığını, kodu tam anlayamadığını ve yorulduğunu söyler.

Oyunun AI'ı:
1. Oyuncunun tasarım beklentilerinin yeterince açık olmayabileceğini fark eder.
2. Oyuncunun tasarım tercihlerini kaydetmek için `design.md` dosyası oluşturmayı önerir veya uygun kurallar çerçevesinde dosyayı hazırlar.
3. Sonraki görevlerde tasarım gereksinimlerini netleştirmeye ve kodu anlamaya odaklanan destek sunabilir.
4. Oyuncunun yorgunluğunu dikkate alarak daha küçük bir sonraki adım önerebilir.

Bu geri bildirim yargılayıcı olmamalıdır. Oyuncunun zorlanması bir başarısızlık etiketi değil, yeni bir öğrenme fırsatıdır.

## 10. `design.md` ve oyuncunun tercihlerini kaydetme

Oyuncunun bilgisayarında, proje tasarım tercihlerini saklayan `design.md` gibi dosyalar bulunabilir.

Bu dosyalar:
- Tasarım tercihlerini
- Arayüz beklentilerini
- Proje gereksinimlerini
- AI ile çalışma kurallarını
- Henüz cevaplanmamış tasarım sorularını

içerebilir.

Örnek içerik:

```markdown
# Design Preferences

## UI Preferences
- Butonlar açık bir görsel hiyerarşiye sahip olmalı.
- Buton metinleri anlaşılır olmalı.
- Hover, active ve disabled durumları tanımlanmalı.
- Boyut ve boşluklar tutarlı olmalı.

## Collaboration with AI
- Gereksinimler belirsizse AI önce açıklayıcı sorular sormalı.
- Önemli uygulama kararları açıklanmalı.
- Mevcut tasarım kararları onay alınmadan değiştirilmemeli.

## Open Questions
- Tercih edilen buton şekli: henüz doğrulanmadı.
- Tercih edilen renk paleti: henüz doğrulanmadı.
- Tercih edilen animasyon stili: henüz doğrulanmadı.
```

Bu örnek, oyuncunun gerçek tercihleri doğrulanmadan otomatik olarak kesinleştirilmemelidir. AI, doğrulanmış tercihler ile henüz cevaplanmamış soruları birbirinden ayırmalıdır. Oyuncu bu dosyaları görüntüleyebilmeli ve düzenleyebilmelidir.

## 11. AI'ın rolü ve özerklik seviyesi

AI'ın temel görevi oyuncuyu tanımak, proje bağlamını korumak, uygun görevler önermek ve oyun dünyasının tepkilerini tutarlı hâle getirmektir.

Şimdilik benimsenen yaklaşım **iş birliği yapan AI** modelidir:
- Günlükleri ve oyun olaylarını değerlendirir.
- Oyuncunun tercihlerini ve proje bağlamını dosyalara dönüştürebilir.
- Yeni görevler ve öğrenme fırsatları önerebilir.
- Oyuncunun gelişimine göre görev zorluğunu uyarlayabilir.
- Önemli veya belirsiz tercihleri oyuncuyla doğrular.
- Oyuncunun yerine kesin kararlar vermekten kaçınır.

AI'ın hangi dosyaları otomatik değiştirebileceği, hangi işlemlerde onay isteyeceği ve oyun durumunu nasıl güncelleyeceği ileride ayrıca tasarlanacaktır.

## 12. Görev zorluğu ve dünya tepkileri

Oyuncunun görevleri tamamlama biçimi ve verdiği yanıtlar, gelecekte karşısına çıkacak görevleri etkileyebilir.

Olası etkiler:
- Görevlerin zorluğunun değişmesi
- Yeni yan görevlerin açılması
- Hocaların daha karmaşık projeler vermesi
- Arkadaşlarla iş birliği fırsatlarının doğması
- Spor salonundaki karakterlerin oyuncuya yaklaşımının değişmesi
- Oyuncunun projelerinin üniversite hayatında yeni fırsatlar yaratması
- Bilgisayar ortamındaki projelerin ve dosyaların kişiselleşmesi

Bu etkiler yalnızca doğru/yanlış sonuçlarına dayanmamalıdır. Süreç, öğrenme, karar kalitesi ve oyuncunun yaşam dengesi de önemlidir. Hatalı kararlar oyunu kilitlemek yerine yeni öğrenme yolları açabilir.

## 13. Dört yıllık eğitimi bir oyun yılına sıkıştırma fikri

Oyunun temel teması, yazılım mühendisliği öğrencisinin üniversite boyunca gelişimidir. Dört yıllık yolculuğun yaklaşık bir oyun yılı içinde deneyimlenmesi istenmektedir.

Henüz kararlaştırılmamış konular:
- Oyun yılı kaç oyun gününden oluşacak?
- Akademik dönemler ve sınav haftaları nasıl temsil edilecek?
- Zaman doğrudan hızlandırılacak mı, yoksa önemli olaylardan oluşan bölümler mi kullanılacak?
- Oyuncunun seçimleri dört yıllık hikâyenin hangi noktalarını değiştirecek?

Bu konu, oyunun temposu ve görev sayısı belirlenirken ele alınmalıdır.

## 14. Temel oyun deneyimi örneği

1. Oyuncu aynı başlangıç hikâyesiyle üniversiteye başlar.
2. Bir ders ödevi alır ve akşam bilgisayarında çalışır.
3. AI'dan kod veya tasarım üretmesini ister.
4. Üretilen sonuç beklentisini karşılamaz; oyuncu kodu anlamakta zorlanır.
5. Gün sonunda bunu günlüğünde belirtir.
6. Oyun AI'ı, oyuncunun tercihlerini daha iyi anlamak için `design.md` oluşturur veya günceller.
7. Sonraki günlerde oyuncuya tasarım gereksinimlerini netleştirme ve kodu inceleme fırsatları sunulur.
8. Oyuncu ayrıca temel kriterleri olan bir mini oyun geliştirme yan görevi alabilir.
9. Oyuncunun verdiği kararlar, geliştirdiği proje ve öğrendikleri ilerideki görevleri ve oyun dünyasındaki ilişkileri etkiler.

Bu örnek, günlük, AI profili, dosyalar, görevler ve yaşam simülasyonu sistemlerinin birbiriyle nasıl bağlantılı olabileceğini gösterir.

## 15. Henüz kesinleşmeyen tasarım soruları

- Oyuncu karakterinin görünümü ve kişiselleştirme seçenekleri neler olacak?
- Oyun içi zaman ve enerji sistemi nasıl hesaplanacak?
- Oyun yılı kaç oyun gününden oluşacak?
- Görünür istatistikler nasıl artacak veya azalacak?
- AI profili hangi verileri saklayacak ve oyuncu bu verileri nasıl görebilecek?
- AI'ın dosya oluşturma ve değiştirme yetkileri hangi sınırlar içinde olacak?
- Oyuncunun kod yazdığı ortam oyun içinde nasıl temsil edilecek?
- Üretilen mini oyunlar gerçekten oynanabilir ve test edilebilir olacak mı?
- Görevler nasıl değerlendirilecek; otomatik testler, oyuncu açıklamaları veya farklı ölçütler kullanılacak mı?
- Hikâyenin ana hedefi ve oyunun sonu ne olacak?

## 16. Kısa özet

Zombie Coder; aynı dünyada başlayan oyuncuların, bilgisayarlarında yaptıkları tercihler ve zaman içinde geliştirdikleri projeler sayesinde farklı hayat hikâyeleri oluşturduğu bir 2D yaşam ve yazılım geliştirme simülasyonudur.

Üniversite, ev, spor salonu ve sosyal alanlar oyunun yaşam katmanını oluşturur. Bilgisayar; ödevler, kişisel projeler, AI ile çalışma ve zombie kod görevlerinin yürütüldüğü dijital katmandır. Gün sonu günlüğü, görünür istatistikler ve gizli AI profili bu iki katmanı birbirine bağlar.

**Ana fikir:** Oyuncu yalnızca yazılım geliştirmeyi öğrenmez; AI ile çalışmayı, kodu anlamayı, teknik kararlar vermeyi ve kendi dijital çalışma biçimini oluşturmayı deneyimler.
