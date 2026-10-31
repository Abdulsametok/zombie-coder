# Zombie Coder — Game Mechanics

> **Belge amacı:** `idea.md` dosyasında tanımlanan oyun fikrinin oyuncu deneyimini şekillendiren mekaniklerini açıklamak. Oyunun nasıl kodlanacağı ve hangi teknolojilerin kullanılacağı daha sonra `technic.md` dosyasında ele alınacaktır.

## 1. Temel yaklaşım: yaşayan kişisel dünya

Zombie Coder, herkesin aynı temel dünyada başladığı; ancak oyuncunun kararları, davranışları, projeleri ve geri bildirimleriyle zamanla kendine özgü hâle gelen bir oyundur.

Oyuncular aynı başlangıç dünyasını, temel karakterleri, üniversiteyi ve ana oyun kurallarını paylaşır. Buna karşılık üstlendikleri görevler, geliştirdikleri projeler, kurdukları ilişkiler, karşılaştıkları problemler ve öğrendikleri konular farklılaşır.

**Temel ilke:** Sabit dünya, değişken dijital eylemler, kişiye özgü sonuçlar.

Amaç her oyuncuya tamamen farklı bir oyun sunmak değil; ortak bir dünyada oyuncunun seçimlerine anlamlı ve tutarlı tepkiler veren kişisel bir deneyim oluşturmaktır.

## 2. Sabit ve değişken oyun katmanları

### 2.1. Sabit oyun çekirdeği

Herkes için ortak olan ve oyuncu bazında değiştirilmeyen temel kurallardır:
- 2D dünyanın yapısı ve hareket kuralları
- Üniversite, ev, spor salonu gibi ana mekânlar
- Gün ve zaman akışı
- Enerji ve temel oyuncu istatistiklerinin çalışma ilkeleri
- Görevlerin kabul, tamamlama ve değerlendirme kuralları
- Oyun bütünlüğünü ve oyuncu güvenliğini koruyan sınırlar

Yapay zekâ bu çekirdeği doğrudan değiştiremez. Böylece kişiselleştirme, oyunun temel kurallarını bozmaz.

### 2.2. Kişiye özel değişken dünya

Oyuncunun ilerleyişine göre değişebilen oyun içeriğidir:
- Yeni görevler ve görev zorlukları
- Proje gereksinimleri ve proje aşamaları
- Karakterlerin oyuncuya verdiği tepkiler
- Hikâye olayları ve diyaloglar
- Oyuncunun ilgi alanlarına uygun öğrenme fırsatları
- Çalışma ortamı tercihleri
- Oyuncunun kararları sonucunda gelişen ilişkiler

Bu içerikler her oyuncu için ayrı ayrı şekillenir.

## 3. Personalzy: kişisel oyun asistanı

Personalzy, oyuncunun oyun içindeki davranışlarını ve açıkça ifade ettiği tercihleri takip ederek deneyimin kişiselleştirilmesine yardımcı olan yapay zekâ katmanıdır.

Görevleri:
1. Oyuncunun oyun içi eylemlerini ve günlük değerlendirmelerini anlamlandırmak.
2. İlgi alanlarını, hedeflerini ve tercihlerini takip etmek.
3. Seviyesine uygun görev ve öğrenme fırsatları önermek.
4. Projeler ve oyun dünyası için yeni içerikler hazırlamak.
5. Oyuncu kararlarının olası sonuçlarını değerlendirmek.
6. Belirsiz veya önemli konularda açıklama ya da onay istemek.

Personalzy oyuncunun yerine sürekli karar veren bir yönetici değildir. Seçenekler sunan, deneyimi anlamlandıran ve gerektiğinde rehberlik eden bir yardımcıdır.

## 4. Kişisel dünyanın gelişim döngüsü

1. **Eylem:** Oyuncu derse katılır, görev yapar, proje geliştirir, karakterle etkileşir veya günlüğünü doldurur.
2. **Gözlem:** Oyun, gerçekleşen eylemleri ve sonuçları kaydeder.
3. **Yorumlama:** Personalzy, mevcut dünya durumunu ve oyuncunun geçmişini dikkate alarak olayları yorumlar.
4. **Öneri üretimi:** Yeni görev, olay, diyalog, proje adımı veya öğrenme fırsatı önerir.
5. **Doğrulama:** Önerinin oyun kurallarına, oyuncunun seviyesine ve dünya durumuna uygunluğu kontrol edilir.
6. **Dünyaya uygulama:** Uygun bulunan içerik oyuncunun kişisel dünyasına eklenir.
7. **Geri bildirim:** Oyuncunun tepkisi sonraki kişiselleştirme kararlarında kullanılır.

Bu döngü, geliştiricinin her oyuncu için ayrı görev veya hikâye yazmasına gerek kalmadan kişisel içerik üretilmesini sağlar.

## 5. Günlük yaşam ve oyun içi kararların etkisi

Üniversite, ev, spor salonu ve sosyal alanlardaki tercihler birbirinden bağımsız düşünülmez.

Örnekler:
- Arka arkaya yoğun proje çalışmak enerji seviyesini düşürebilir.
- Spor salonuna gitmek fiziksel enerji ve motivasyonu olumlu etkileyebilir.
- Sosyal etkinliklere katılmak karakter ilişkilerini geliştirebilir.
- Bir ödevi anlamadan tamamlamak kısa vadede zaman kazandırsa da sonraki görevlerde kavrama güçlüğü yaratabilir.
- Bir hatayı araştırarak çözmek, benzer problemlerde yeni seçenekler açabilir.

Bu sonuçlar kesin ve cezalandırıcı kurallar olmamalıdır. Oyuncuya farklı seçimlerin sonuçlarını deneyimleme fırsatı vermelidir.

## 6. Bilgisayar ve dijital dünya mekaniği

Oyuncunun evindeki bilgisayar, yazılım geliştirme deneyiminin merkezidir. Oyuncu burada yalnızca görev listesi görüntülemez; dosyalar, projeler, kodlar, yapay zekâ çıktıları ve teknik kararlarla etkileşime girer.

Örnek çalışma alanları:
- **University:** Dersler, ödevler, sınavlar ve akademik projeler.
- **My Projects:** Oyuncunun kendi geliştirdiği uygulamalar ve oyunlar.
- **AI Memory:** Onaylanmış tercihler, hedefler ve projeler için önemli bağlam.
- **Zombie Projects:** Eski, yarım kalmış veya sorun içeren yazılım projeleri.

Bu alanlar ilerledikçe yeni dosyalar ve görevlerle genişleyebilir. Bilgisayarda yapılan çalışmalar, 2D dünyadaki gelişmeleri de etkileyebilir.

## 7. Yapay zekâ ile çalışma ve kod değerlendirme

Oyunun öğrenme yaklaşımı yalnızca kod yazdırmak değildir. Oyuncunun kodu okuyabilmesi, anlayabilmesi, test edebilmesi ve yapay zekâ çıktısını değerlendirebilmesi önemlidir.

Örnek görev akışı:
1. Oyuncuya bir yazılım ihtiyacı veya problem verilir.
2. Oyuncu çözümü kendi yazabilir ya da yapay zekâdan yardım alabilir.
3. Yapay zekâ kod veya çözüm önerisi üretir.
4. Oyuncu kodu inceler, sorular sorar ve test eder.
5. Hataları veya eksikleri belirler.
6. Çözümü kabul eder, değiştirir ya da yeniden ele alır.
7. İzlenen süreç ve ortaya çıkan sonuç birlikte değerlendirilir.

Yapay zekâ çıktısını doğrudan kabul etmek otomatik olarak başarısızlık sayılmaz. Önemli olan oyuncunun çözümün ne yaptığını ve hangi riskleri taşıdığını anlayabilmesidir.

## 8. Zombie Projects mekaniği

Zombie Projects, oyuncunun eski veya yarım bırakılmış yazılım projeleriyle karşılaştığı görev türüdür.

Oyuncu projeyi inceleyerek:
- Kodun ne yaptığını anlamaya,
- Hataları bulmaya,
- Testleri çalıştırmaya,
- Bağımlılıkları incelemeye,
- Teknik borcu değerlendirmeye,
- Düzeltme, yeniden düzenleme veya projeyi sonlandırma kararı vermeye

çalışır.

Eski kod otomatik olarak kötü kabul edilmez. Amaç her şeyi baştan yazmak değil, mevcut sistemin değerini ve risklerini anlayarak doğru mühendislik kararını vermektir.

## 9. Yan görevler ve oyuncunun kendi projeleri

Yan görevler, belirli öğrenme hedefleri sunarken çözümün tasarımında özgürlük tanır.

Örnekler:
- **Başlangıç:** Hareket, engel, çarpışma ve kazanma/kaybetme koşulları içeren küçük bir platform oyunu.
- **Orta seviye:** Harita üzerinde hareket, toplanabilir nesneler, basit envanter ve puan takibi içeren hazine avı.
- **İleri seviye:** Hatalı veya yarım kalmış bir mini oyunun mevcut kodunu anlayarak onarılması.

Görevler tek bir doğru görsel veya kod çözümüne zorlamamalıdır. Temel gereksinimler tanımlanmalı; tasarım ve uygulama konusunda oyuncuya seçim alanı bırakılmalıdır.

## 10. Oyuncu ilerlemesi ve kişisel profil

Oyuncunun gelişimi iki katmanda izlenir.

### 10.1. Görünür oyun istatistikleri

Arayüzde gösterilebilecek örnek değerler:
- Kod okuma
- Sistem düşüncesi
- Problem çözme
- Motivasyon
- Fiziksel enerji
- Sosyal bağlar

Bu değerler yalnızca görev tamamlamaya göre değil, oyuncunun izlediği süreçlere ve yaşam tercihleriyle oluşan sonuçlara göre değişir.

### 10.2. Gizli kişisel öğrenme profili

Personalzy'nin kişiselleştirme amacıyla takip ettiği bağlamdır:
- Oyuncunun yapay zekâ çıktısını ne sıklıkla sorguladığı
- Hata araştırırken izlediği yöntemler
- Hangi açıklama biçimlerinden daha iyi yararlandığı
- Hangi konulara ilgi duyduğu
- Kendi ifade ettiği hedefler ve zorlandığı alanlar

Bu profil kesin kişilik etiketleri üretmemelidir. Çıkarımlar geçici, gözleme dayalı ve oyuncunun geri bildirimiyle değiştirilebilir olmalıdır.

## 11. Gün sonu günlüğü

Oyuncu yatağa gittiğinde günün sonunda kısa bir değerlendirme yapar.

Örnek sorular:
1. Bugün kendinle ilgili ne fark ettin?
2. Bugün nasıl hissettin?
3. Yarın neyi farklı yapmak istersin?
4. İstersen eklemek istediğin başka bir şey var mı?

Oyuncu kısa cevaplar verebilir veya serbest biçimde yazabilir. Günlük, uzun ve zorunlu bir sohbet hâline gelmemelidir.

Personalzy günlük cevaplarını gün içinde gerçekleşen olaylarla birlikte değerlendirir. Örneğin oyuncu kodu anlamadan yapay zekâdan aldığını belirtirse sonraki günlerde kod okuma ve açıklama odaklı görev önerebilir. Oyuncu yorgun olduğunu ifade ederse görev yoğunluğu ve öneriler buna göre uyarlanabilir.

## 12. Kişisel tercih dosyaları

Oyuncunun zaman içinde belirttiği ve onayladığı tercihleri saklamak için oyun içinde düzenlenebilir dosyalar bulunabilir.

Örneğin `design.md`:
- Butonlarda açık bir görsel hiyerarşi olmalı.
- Metinler anlaşılır ve kısa olmalı.
- Hover, active ve disabled durumları tanımlanmalı.
- Boyut ve boşluklar tutarlı olmalı.
- Belirsiz tasarım gereksinimlerinde önce açıklayıcı soru sorulmalı.
- Önemli teknik kararlar kısaca açıklanmalı.
- Mevcut tasarım tercihleri onay alınmadan değiştirilmemeli.

Personalzy, oyuncunun açıkça belirttiği tercihler ile kendi tahminlerini birbirinden ayırmalıdır. Onaylanmamış çıkarımlar kesin tercih gibi kaydedilmemelidir. Oyuncu bu dosyaları görüntüleyebilmeli ve düzenleyebilmelidir.

## 13. İçerik doğrulama ve oyuncu kontrolü

Yapay zekânın ürettiği her içerik doğrudan oyun dünyasına uygulanmamalıdır.

Uygulamadan önce şu kontroller yapılmalıdır:
- İçerik oyunun temel kurallarına uyuyor mu?
- Görev mevcut oyuncu seviyesine uygun mu?
- Yeni olay mevcut hikâye ve dünya durumuyla çelişiyor mu?
- Görev gereksinimleri açık ve değerlendirilebilir mi?
- Kod içeren görevlerde çözüm güvenli biçimde test edilebilir mi?
- Öneri oyuncunun daha önce belirttiği tercihlerle çelişiyor mu?

Oyuncunun ilerleyişini, ilişkilerini veya önemli proje kararlarını etkileyen değişikliklerde onay alınmalıdır. Küçük diyalog veya görev varyasyonları gibi düşük riskli içerikler, belirlenmiş sınırlar içinde otomatik uygulanabilir.

Yapay zekâ kendi ürettiği görevin tek değerlendiricisi olmamalıdır. Mümkün olduğunda açık kabul kriterleri, testler ve bağımsız doğrulama kuralları kullanılmalıdır.

## 14. Oyunun kendini geliştirmesi: sınırlar

Oyunun kişiselleşmesi için yapay zekânın kendi temel modelini yeniden eğitmesi veya oyunun kaynak kodunu değiştirmesi gerekmez.

Gelişim şu yollarla sağlanır:
- Oyuncuya özel kalıcı hafıza
- Oyuncunun dünyasına özel içerik üretimi
- Görev ve zorluk seviyesinin uyarlanması
- Hikâye, diyalog ve karakter tepkilerinin çeşitlenmesi
- Oyuncunun tercih dosyalarının güncellenmesi
- Oyuncu geri bildirimlerine göre öneri stratejisinin iyileştirilmesi

Yapay zekâ oyun motorunun kaynak kodunu doğrudan değiştiremez ve üretim ortamında kontrolsüz kod çalıştıramaz. Kişiselleştirme, önceden tanımlanmış oyun mekanikleri ve kontrollü içerik alanları üzerinden yürütülür.

## 15. Sürüm ve kişisel deneyim ayrımı

Oyuncunun deneyiminin gelişmesi, istemci uygulamasının sürekli güncellenmesini gerektirmez.

Örneğin oyun istemcisi `1.0.0` sürümünde kalırken:
- A oyuncusunun dünyasında farklı görevler ve ilişkiler gelişebilir.
- B oyuncusunun dünyasında farklı projeler ve öğrenme fırsatları oluşabilir.
- Her iki oyuncu da aynı temel oyun kurallarını kullanmaya devam eder.

Buradaki “oyunun güncellenmemesi”, oyuncunun her yeni içerik için yeni istemci sürümü indirmemesi anlamına gelir. Sunucu tarafındaki hizmetlerin, güvenlik kontrollerinin veya yapay zekâ sistemlerinin bakım ve iyileştirmesi ayrı bir konudur.

## 16. Tasarım ilkeleri

1. **Kişiselleştirme tutarlılığı bozmamalı:** Her yeni içerik oyuncunun dünyasının geçmişiyle uyumlu olmalı.
2. **Oyuncu karar sahibi olmalı:** Yapay zekâ rehberlik etmeli, önemli kararları oyuncunun elinden almamalı.
3. **Hata öğrenme fırsatı olmalı:** Yanlış kararlar oyuncuyu kalıcı biçimde cezalandırmamalı.
4. **Süreç, sonuç kadar önemli olmalı:** Kodun nasıl anlaşıldığı ve doğrulandığı da değerlendirilmelidir.
5. **Tercihler doğrulanmalı:** Yapay zekâ tahminleri oyuncunun kesin tercihi olarak kaydedilmemeli.
6. **Zorluk uyarlanmalı:** Görevler oyuncunun gelişimine göre zorlaşmalı veya farklı biçimde sunulmalı.
7. **Dünya hafızalı olmalı:** Önceki eylemler, kararlar ve ilişkiler sonraki deneyimi etkilemeli.
8. **Güvenli sınırlar korunmalı:** Yapay zekâ temel oyun kurallarını veya kaynak kodunu kontrolsüz biçimde değiştirememeli.

## `idea.md` ve `technic.md` ile ilişkisi

| Belge | Sorumluluğu |
|---|---|
| `idea.md` | Zombie Coder nedir, hangi problemi ele alır ve nasıl bir deneyim hedefler? |
| `mechanics.md` | Oyuncu ne yapar, oyun nasıl tepki verir ve kişisel dünya nasıl gelişir? |
| `technic.md` | Oyun hangi mimari, teknoloji, veri modeli ve geliştirme süreçleriyle hayata geçirilir? |

**Açık kalan teknik kararlar:** Oyun motoru ve istemci teknolojisi, sunucu mimarisi, yapay zekâ ajanının araçları, hafıza saklama yöntemi, veri şemaları, içerik doğrulama sistemi, güvenlik/sandbox yaklaşımı ve dağıtım modeli `technic.md` belgesinde belirlenecektir.
