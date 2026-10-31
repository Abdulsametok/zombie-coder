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

## 3. Mevcut Durum (Faz 0–4 Tamamlandı)

- [x] **Faz 0:** `idea.md`, `mechanics.md`, `technic.md`, `plan.md`, `curriculum.md`, `agent.md` ve Google Stitch tasarım paketi incelendi ve doğrulandı.
- [x] **Faz 1:** Bare React Native CLI + TypeScript (`0.78.2`) iskeleti ve `emulator`, `metro`, `android:emulator`, `android:aab`, `lint`, `type-check`, `test` scriptleri yapılandırıldı.
- [x] **Faz 2:** `@shopify/react-native-skia` (`2.0.7`) ile 12x12 karo tabanlı (tile-grid) 2D sahne, 4 yönlü D-Pad hareketi, duvar/mobilya çarpışma sistemi, etkileşim algılama (`[E]`) ve Stitch HUD arayüzü tamamlandı.
- [x] **Faz 3:** Ev (`dorm`), Üniversite (`university`) ve Spor Salonu (`gym`) 2D sahne geçişleri, Yeni Kariyer Kurulumu ([CareerSetupScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/CareerSetupScreen.tsx)) ve Zorunlu Gün Sonu Günlüğü ([EndOfDayJournalScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/EndOfDayJournalScreen.tsx)) bağlandı.
- [x] **Faz 4:** `ZombieOS v2.4` masaüstü ([ZombieOsDesktopScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/ZombieOsDesktopScreen.tsx)), `design.md` tercih & risk kartı, 3 farklı mühendislik görevi türü (`Zombie Projeleri`, `Üniversite`, `Projelerim`) ve Kod Okuma / AI Denetimi ([CodeAuditTaskScreen.tsx](file:///c:/Users/mrasa/OneDrive/Desktop/zombie_coder/src/screens/CodeAuditTaskScreen.tsx)) ekranı tamamlandı.

## 4. Sonraki Adımlar (Faz 5–6)

- **Faz 5:** Firebase Auth / Firestore dünya durumu izolasyonu ve kalıcı oyuncu kaydı.
- **Faz 6:** Cloud Run üzerinden Gemini API (`Personalzy` günlük değerlendirme ajanı — `agent.md`) canlı entegrasyonu.
