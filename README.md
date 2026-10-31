# Zombie Coder — 2D Yazılım Mühendisliği & Yaşam Simülasyonu

**Zombie Coder**, dört yıllık yazılım mühendisliği öğrencilik sürecini oyunlaştıran; kod okuma, sistem düşüncesi, AI tarafından üretilen kodu denetleme (`Zombie Trap` senaryoları) ve kişisel mühendislik gelişimini konu alan **2D mobil yaşam simülasyonu** oyunudur.

## 1. Teknoloji Yığını ve Mimari

- **Mobil İstemci:** Bare React Native CLI (`0.78.2`) + TypeScript (Expo kullanılmaz, Dikey / Portrait mod).
- **2D Sahne ve Çizim:** `@shopify/react-native-skia` (`2.0.7`) ile karo tabanlı (tile-grid) 2D oda/kampüs sahnesi ve çarpışma motoru.
- **Tasarım Sistemi:** Google Stitch ile hazırlanan **Cyberpunk Terminal UI + Tactile Retro-Modern Sim Controls** ([DESIGN.md](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/stitch_zombie_coder_ui_design/zombie_coder/DESIGN.md)).
- **Müfredat & AI Değerlendirme:** NotebookLM ile oluşturulan 4 yıllık müfredat ([curriculum.md](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/curriculum.md)) ve Google AI Studio / Gemini tabanlı **Personalzy** günlük analiz ajanı ([agent.md](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/agent.md)).

## 2. Geliştirme ve Test Komutları

Üç ayrı terminalde (veya sırasıyla) aşağıdaki standart iş akışı kullanılır:

```bash
# 1. Android Emülatörünü başlat
npm run emulator

# 2. Metro Bundler'ı başlat
npm run metro

# 3. Android uygulamasını derle ve emülatöre yükle
npm run android:emulator

# 4. (İsteğe bağlı) Yayın için Android App Bundle (.aab) üret
npm run android:aab
```

### Kalite Kontrol ve Test Komutları

```bash
# TypeScript tip kontrolü
npm run type-check

# ESLint kod standartları kontrolü
npm run lint

# Jest birim ve bileşen testleri
npm test
```

## 3. Tamamlanan Fazlar (Faz 0–8 Tamamlandı)

- [x] **Faz 0:** `idea.md`, `mechanics.md`, `technic.md`, `plan.md`, `curriculum.md`, `agent.md` ve Google Stitch tasarım paketi incelendi ve doğrulandı.
- [x] **Faz 1:** Bare React Native CLI + TypeScript (`0.78.2`) iskeleti ve `emulator`, `metro`, `android:emulator`, `android:aab`, `lint`, `type-check`, `test` scriptleri yapılandırıldı.
- [x] **Faz 2:** `@shopify/react-native-skia` (`2.0.7`) ile 12x12 karo tabanlı (tile-grid) 2D sahne, 4 yönlü D-Pad hareketi, duvar/mobilya çarpışma sistemi, etkileşim algılama (`[E]`) ve Stitch HUD arayüzü tamamlandı.
- [x] **Faz 3:** Ev (`dorm`), Üniversite (`university`) ve Spor Salonu (`gym`) 2D sahne geçişleri, Yeni Kariyer Kurulumu ([CareerSetupScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/CareerSetupScreen.tsx)) ve Zorunlu Gün Sonu Günlüğü ([EndOfDayJournalScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/EndOfDayJournalScreen.tsx)) bağlandı.
- [x] **Faz 4:** `ZombieOS v2.4` masaüstü ([ZombieOsDesktopScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/ZombieOsDesktopScreen.tsx)), `design.md` tercih & risk kartı, 4 yıllık müfredatı kapsayan 7 etkileşimli mühendislik görevi ([taskCatalog.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/features/tasks/taskCatalog.ts)) ve Kod Okuma / AI Denetimi ([CodeAuditTaskScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/CodeAuditTaskScreen.tsx)) ekranı tamamlandı.
- [x] **Faz 5:** UID bazlı oyuncu veri izolasyonu ([firestoreWorldStore.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/backend/src/modules/world/firestoreWorldStore.ts)), Firestore güvenlik kuralları ([firestore.rules](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/firestore.rules)), idempotent `eventId` işleme ve iki test hesabıyla (`player_a_deniz` / `player_b_mert`) izolasyon doğrulaması tamamlandı.
- [x] **Faz 6:** Cloud Run / Node.js API sunucusu ([backend/src/index.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/backend/src/index.ts)), `@google/genai` ile `agent.md` tabanlı **Personalzy** günlük değerlendirme servisi ([personalzyService.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/backend/src/modules/personalzy/personalzyService.ts)), prompt injection koruması, `[-10, +10]` metrik sınır doğrulaması ([schemaValidator.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/backend/src/modules/validation/schemaValidator.ts)) ve çevrimdışı/kota aşımı durumunda kesintisiz şablon fallback mekanizması tamamlandı.
- [x] **Faz 7:** Sosyal ilişkiler (`Koç Burak`, `Prof. Demir`, `Asistan Elif`, `Kaan`), tanışıklık ve güven kademeleri (`first_time`, `acquaintance`, `regular_trusted`), üslup adaptasyonu (`Samimi` / `Resmi`) ve tekrara düşmeyen diyalog motoru ([npcRelationshipEngine.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/features/social/npcRelationshipEngine.ts)) tamamlandı.
- [x] **Faz 8:** 4 yıllık müfredat yol haritası (`G1.1`–`G8.2`, [curriculumRoadmap.ts](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/features/curriculum/curriculumRoadmap.ts)), kullanıcı gizliliği / AI bellek sıfırlama kontrolü ve üretim `.aab` derleme betiği ([build-aab.cjs](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/scripts/build-aab.cjs)) tamamlandı.
