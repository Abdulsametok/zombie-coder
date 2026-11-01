import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AvatarStyleId, useGame } from '../state/GameContext';
import {
  AVATAR_STYLE_SPRITE_PREVIEW,
  GAME_LOGO_ASSET,
  getAvatarPreviewSource,
} from '../game/sprites/mainCharSprites';
import { TEST_PLAYER_ACCOUNTS } from '../services/playerWorldService';
import { Colors } from '../theme/designSystem';

const AVATAR_STYLES: Array<{
  id: AvatarStyleId;
  label: string;
  icon: string;
  spriteTag: string;
}> = [
  {
    id: 'hacker_hoodie',
    label: 'Kapüşonlu',
    icon: '▣',
    spriteTag: 'CYBER_HOODIE.SPRITE',
  },
  {
    id: 'cyber_casual',
    label: 'Gözlüklü',
    icon: '◈',
    spriteTag: 'CYBER_OPTIC.SPRITE',
  },
  {
    id: 'insomniac',
    label: 'Uykusuz',
    icon: '☾',
    spriteTag: 'INSOMNIA_DEV.SPRITE',
  },
  {
    id: 'glitch_mod',
    label: 'Glitch',
    icon: '⚡',
    spriteTag: 'GLITCH_MOD.SPRITE',
  },
];

const GRADES: Array<{
  grade: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  desc: string;
}> = [
  {
    grade: 1,
    title: '1. Sınıf',
    subtitle: 'Çaylak Öğrenci',
    desc: 'Hello World coşkusu & yüksek moral.',
  },
  {
    grade: 2,
    title: '2. Sınıf',
    subtitle: 'Veri Yapıları Kurbanı',
    desc: 'Pointer kabusları ve ilk vize çöküşü.',
  },
  {
    grade: 3,
    title: '3. Sınıf',
    subtitle: 'Zombie Kod Avcısı',
    desc: 'Spaghetti kodlar & Staj mülakatları.',
  },
  {
    grade: 4,
    title: '4. Sınıf',
    subtitle: 'Bitirme Tezi Kurtulanı',
    desc: 'Jüri korkusu ve kronik insomnia.',
  },
];

export function CareerSetupScreen(): React.JSX.Element {
  const {
    profile,
    activePlayerUid,
    worldRevision,
    switchPlayerAccount,
    startCareer,
  } = useGame();
  const [name, setName] = useState<string>(profile.name);
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>(
    profile.gender || 'female',
  );
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyleId>(
    profile.avatarStyle,
  );
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3 | 4>(
    profile.grade,
  );

  const handleSelectAccount = (uid: string, defaultName: string) => {
    switchPlayerAccount(uid);
    setName(defaultName);
    const acc = TEST_PLAYER_ACCOUNTS.find(a => a.uid === uid);
    if (acc?.gender) {
      setSelectedGender(acc.gender);
    }
  };

  const activeAvatarMeta =
    AVATAR_STYLES.find(a => a.id === avatarStyle) || AVATAR_STYLES[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* System Status Banner */}
        <View style={styles.sysBanner}>
          <View style={styles.sysBannerLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.sysBannerText}>
              SYS.INIT // v2.4.0-DEV_BUILD
            </Text>
          </View>
          <Text style={styles.sysNodeText}>NODE::CAMPUS_MAINFRAME</Text>
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.heroBannerRow}>
            <Image
              source={GAME_LOGO_ASSET}
              style={styles.heroLogoImage}
              resizeMode="contain"
            />
            <View style={styles.flexOne}>
              <View style={styles.simBadge}>
                <Text style={styles.simBadgeText}>
                  &gt;_ ZOMBIE CODER: SIMULATOR
                </Text>
              </View>
              <Text style={styles.mainTitle}>Yeni Kariyer Başlat</Text>
              <Text style={styles.subtitle}>
                Öğrenci Hayatı & AI Denetim Macerası. Finallere kadar hayatta
                kalabilecek misin?
              </Text>
            </View>
          </View>
        </View>

        {/* Faz 5: Firebase Auth & Oyuncu Veri İzolasyonu Hesap Seçici */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>
              🔐 OYUNCU HESABI & VERİ İZOLASYONU (FAZ 5)
            </Text>
            <View style={styles.spriteTagBadge}>
              <Text style={styles.spriteTagText}>REV #{worldRevision}</Text>
            </View>
          </View>
          <View style={styles.styleGrid}>
            {TEST_PLAYER_ACCOUNTS.map(acc => {
              const isAccActive = acc.uid === activePlayerUid;
              return (
                <TouchableOpacity
                  key={acc.uid}
                  style={[
                    styles.styleBtn,
                    isAccActive && styles.styleBtnActive,
                  ]}
                  onPress={() =>
                    handleSelectAccount(acc.uid, acc.defaultName)
                  }>
                  <Text
                    style={[
                      styles.styleBtnText,
                      isAccActive && styles.styleBtnTextActive,
                    ]}>
                    {isAccActive ? '◉ ' : '○ '}
                    {acc.badgeLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Character Customization Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>
              ☺ GÖRÜNÜM SEÇİMİ [AVATAR_CFG]
            </Text>
            <View style={styles.spriteTagBadge}>
              <Text style={styles.spriteTagText}>
                {activeAvatarMeta.spriteTag}
              </Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarPreviewBox}>
              <Image
                source={getAvatarPreviewSource(avatarStyle, selectedGender)}
                style={styles.avatarPreviewSprite}
                resizeMode="contain"
              />
              <Text style={styles.avatarPreviewSub}>
                {selectedGender === 'female' ? '👩 Kız' : '👨 Erkek'} • {activeAvatarMeta.label}
              </Text>
              <View style={styles.lvBadge}>
                <Text style={styles.lvBadgeText}>LV.{selectedGrade}</Text>
              </View>
            </View>

            <View style={styles.styleSelectorCol}>
              <Text style={styles.smallMutedLabel}>KARAKTER CİNSİYETİ</Text>
              <View style={styles.genderSwitchRow}>
                <TouchableOpacity
                  accessibilityLabel="Kız Karakter"
                  style={[
                    styles.genderSwitchBtn,
                    selectedGender === 'female' && styles.genderSwitchBtnActive,
                  ]}
                  onPress={() => setSelectedGender('female')}>
                  <Text
                    style={[
                      styles.genderSwitchBtnText,
                      selectedGender === 'female' &&
                        styles.genderSwitchBtnTextActive,
                    ]}>
                    👩 Kız
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityLabel="Erkek Karakter"
                  style={[
                    styles.genderSwitchBtn,
                    selectedGender === 'male' && styles.genderSwitchBtnActive,
                  ]}
                  onPress={() => setSelectedGender('male')}>
                  <Text
                    style={[
                      styles.genderSwitchBtnText,
                      selectedGender === 'male' &&
                        styles.genderSwitchBtnTextActive,
                    ]}>
                    👨 Erkek
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.smallMutedLabel}>STİL &amp; TİP</Text>
              <View style={styles.styleGrid}>
                {AVATAR_STYLES.map(item => {
                  const active = item.id === avatarStyle;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.styleBtn,
                        active && styles.styleBtnActive,
                      ]}
                      onPress={() => setAvatarStyle(item.id)}>
                      <Text
                        style={[
                          styles.styleBtnText,
                          active && styles.styleBtnTextActive,
                        ]}>
                        {item.icon} {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* 1. Ad Soyad / Kod Adı */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            ▤ Ad Soyad / Kod Adı <Text style={{ color: Colors.error }}>*</Text>
          </Text>
          <View style={styles.terminalInputRow}>
            <Text style={styles.terminalPrompt}>&gt;_</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Örn: Deniz Yılmaz"
              placeholderTextColor={Colors.outline}
              style={styles.terminalInput}
            />
            <View style={styles.cursorBlock} />
          </View>
        </View>

        {/* 2. Eğitim Seviyesi (Akademik Yıl) */}
        <View style={styles.fieldGroup}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.fieldLabel}>
              🎓 Eğitim Seviyesi (Akademik Yıl)
            </Text>
            <Text style={styles.smallMutedLabel}>Zorluk Çarpanı</Text>
          </View>

          <View style={styles.gradeGrid}>
            {GRADES.map(item => {
              const active = item.grade === selectedGrade;
              return (
                <TouchableOpacity
                  key={item.grade}
                  style={[styles.gradeCard, active && styles.gradeCardActive]}
                  onPress={() => setSelectedGrade(item.grade)}>
                  <View style={styles.cardHeaderRow}>
                    <Text
                      style={[
                        styles.gradeTitle,
                        active && styles.gradeTitleActive,
                      ]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.radioDot,
                        active && styles.radioDotActive,
                      ]}>
                      {active ? '◉' : '○'}
                    </Text>
                  </View>
                  <Text style={styles.gradeSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.gradeDesc}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Üniversite & Mühendislik Bölümü */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            🏛 Üniversite & Mühendislik Bölümü
          </Text>
          <View style={styles.lockedRowCard}>
            <View style={styles.deptIconBox}>
              <Text style={styles.deptIconText}>❖</Text>
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.deptTitle}>Bilgisayar Mühendisliği</Text>
              <Text style={styles.deptSub}>
                Yazılım Geliştirme & Sistem Mimarisi
              </Text>
            </View>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        </View>

        {/* Başlangıç Nitelikleri (STATS) */}
        <View style={styles.statsPreviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.fieldLabel}>
              ▤ BAŞLANGIÇ NİTELİKLERİ (STATS)
            </Text>
            <Text style={styles.buffsActiveText}>BUFFS: AKTİF</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statMiniCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statMiniLabel}>⚡ Enerji</Text>
                <Text
                  style={[
                    styles.statMiniVal,
                    { color: Colors.primaryContainer },
                  ]}>
                  %100
                </Text>
              </View>
              <View style={styles.miniProgressTrack}>
                <View style={styles.miniProgressFull} />
              </View>
            </View>

            <View style={styles.statMiniCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statMiniLabel}>◈ Motivasyon</Text>
                <Text
                  style={[styles.statMiniVal, { color: Colors.secondary }]}>
                  %90
                </Text>
              </View>
              <View style={styles.miniProgressTrack}>
                <View style={styles.miniProgressNinety} />
              </View>
            </View>

            <View style={styles.statMiniCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statMiniLabel}>&lt;&gt; Kod Bilgisi</Text>
                <Text
                  style={[
                    styles.statMiniVal,
                    { color: Colors.tertiaryFixedDim },
                  ]}>
                  Lv. {selectedGrade}
                </Text>
              </View>
              <View style={styles.miniProgressTrack}>
                <View
                  style={[
                    styles.miniProgressFill,
                    {
                      width: `${selectedGrade * 25}%`,
                      backgroundColor: Colors.tertiaryFixedDim,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statMiniCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statMiniLabel}>☕ Kahve Stoğu</Text>
                <Text style={[styles.statMiniVal, { color: Colors.primary }]}>
                  3 Kupa
                </Text>
              </View>
              <View style={styles.coffeeDotsRow}>
                <View style={styles.coffeeDotFilled} />
                <View style={styles.coffeeDotFilled} />
                <View style={styles.coffeeDotFilled} />
                <View style={styles.coffeeDotEmpty} />
              </View>
            </View>
          </View>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          accessibilityLabel="Kariyere Başla"
          style={styles.startBtn}
          onPress={() =>
            startCareer({
              name,
              avatarStyle,
              grade: selectedGrade,
              gender: selectedGender,
            })
          }>
          <Text style={styles.startBtnText}>
            ▶ KARİYERE BAŞLA (OYUNA GİR)
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerTelemetry}>
          &gt;_ READY_FOR_EXECUTION // KAMPÜS SİMÜLATÖRÜ HAZIR
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flexOne: {
    flex: 1,
  },
  miniProgressFull: {
    height: '100%',
    borderRadius: 3,
    width: '100%',
    backgroundColor: Colors.primaryContainer,
  },
  miniProgressNinety: {
    height: '100%',
    borderRadius: 3,
    width: '90%',
    backgroundColor: Colors.secondary,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  sysBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sysBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  sysBannerText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  sysNodeText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  headerSection: {
    gap: 6,
  },
  heroBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroLogoImage: {
    width: 78,
    height: 78,
  },
  simBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  simBadgeText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  mainTitle: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLabel: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  spriteTagBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spriteTagText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPreviewBox: {
    width: 88,
    height: 98,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  avatarPreviewSprite: {
    width: 56,
    height: 66,
  },
  avatarEmoji: {
    color: Colors.primaryContainer,
    fontSize: 28,
    fontWeight: '700',
  },
  avatarPreviewSub: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 4,
  },
  lvBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  lvBadgeText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
  },
  styleSelectorCol: {
    flex: 1,
    gap: 6,
  },
  genderSwitchRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  genderSwitchBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#242b3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderSwitchBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  genderSwitchBtnText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  genderSwitchBtnTextActive: {
    color: Colors.primaryContainer,
  },
  smallMutedLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  styleBtn: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  styleBtnActive: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  styleBtnText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
  },
  styleBtnTextActive: {
    color: Colors.primary,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  terminalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  terminalPrompt: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  terminalInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 4,
  },
  cursorBlock: {
    width: 8,
    height: 16,
    backgroundColor: Colors.primaryContainer,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeCard: {
    width: '48.5%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: '#1f2533',
  },
  gradeCardActive: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.primaryContainer,
  },
  gradeTitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  gradeTitleActive: {
    color: Colors.primaryContainer,
  },
  radioDot: {
    color: Colors.outline,
    fontSize: 13,
  },
  radioDotActive: {
    color: Colors.primaryContainer,
  },
  gradeSubtitle: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
  },
  gradeDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 14,
  },
  lockedRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  deptIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptIconText: {
    color: Colors.secondary,
    fontSize: 18,
  },
  deptTitle: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  deptSub: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  lockIcon: {
    fontSize: 14,
  },
  statsPreviewCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  buffsActiveText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statMiniCard: {
    width: '48.5%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  statMiniLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  statMiniVal: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  miniProgressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  coffeeDotsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  coffeeDotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  coffeeDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  startBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  footerTelemetry: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'center',
  },
});
