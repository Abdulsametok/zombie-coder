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
import { GAME_LOGO_ASSET } from '../game/sprites/mainCharSprites';
import {
  SeedPlayerAccount,
  TEST_PLAYER_ACCOUNTS,
} from '../services/playerWorldService';
import { useGame } from '../state/GameContext';
import { Colors } from '../theme/designSystem';

type AuthMode = 'login' | 'register';

const GRADE_OPTIONS: Array<{ grade: 1 | 2 | 3 | 4; label: string }> = [
  { grade: 1, label: '1. Sınıf' },
  { grade: 2, label: '2. Sınıf' },
  { grade: 3, label: '3. Sınıf' },
  { grade: 4, label: '4. Sınıf' },
];

export function AuthScreen(): React.JSX.Element {
  const { registeredAccounts, loginWithCredentials, registerAccount } =
    useGame();

  const [mode, setMode] = useState<AuthMode>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState<string>(
    TEST_PLAYER_ACCOUNTS[0].email,
  );
  const [loginPassword, setLoginPassword] = useState<string>(
    TEST_PLAYER_ACCOUNTS[0].password,
  );

  // Register State
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regGender, setRegGender] = useState<'female' | 'male'>('female');
  const [regGrade, setRegGrade] = useState<1 | 2 | 3 | 4>(1);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectSeedUser = (seed: SeedPlayerAccount) => {
    setMode('login');
    setLoginEmail(seed.email);
    setLoginPassword(seed.password);
    setErrorMessage(null);
  };

  const handleLoginSubmit = () => {
    setErrorMessage(null);
    const res = loginWithCredentials(loginEmail, loginPassword);
    if (!res.ok && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleRegisterSubmit = () => {
    setErrorMessage(null);
    const res = registerAccount({
      email: regEmail,
      password: regPassword,
      fullName: regFullName,
      username: regUsername,
      grade: regGrade,
      gender: regGender,
    });
    if (!res.ok && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* System Token Quota Banner */}
        <View style={styles.sysBanner}>
          <View style={styles.sysBannerLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.sysBannerText}>
              AUTH.GATEWAY // TOKEN KOTA KORUMASI AKTİF
            </Text>
          </View>
          <Text style={styles.sysNodeText}>1000 TOKEN / HESAP</Text>
        </View>

        {/* Logo & Game Title Header */}
        <View style={styles.heroCard}>
          <Image
            source={GAME_LOGO_ASSET}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <View style={styles.heroTextCol}>
            <View style={styles.simBadge}>
              <Text style={styles.simBadgeText}>&gt;_ ZOMBIE CODER: LOGIN</Text>
            </View>
            <Text style={styles.heroTitle}>Öğrenci Girişi & Kayıt</Text>
            <Text style={styles.heroSub}>
              AI denetim ve kişisel tema motoru her hesap için özel token kotası
              kullanır. Devam etmek için giriş yapın veya kayıt olun.
            </Text>
          </View>
        </View>

        {/* Login / Register Mode Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            accessibilityLabel="Giriş Yap Sekmesi"
            style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
            onPress={() => {
              setMode('login');
              setErrorMessage(null);
            }}>
            <Text
              style={[
                styles.tabBtnText,
                mode === 'login' && styles.tabBtnTextActive,
              ]}>
              🔐 GİRİŞ YAP (LOGIN)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Kayıt Ol Sekmesi"
            style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
            onPress={() => {
              setMode('register');
              setErrorMessage(null);
            }}>
            <Text
              style={[
                styles.tabBtnText,
                mode === 'register' && styles.tabBtnTextActive,
              ]}>
              ✨ KAYIT OL (REGISTER)
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {errorMessage}</Text>
          </View>
        )}

        {mode === 'login' ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              &gt;_ MEVCUT HESAPLA GİRİŞ YAP
            </Text>

            {/* E-posta */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>✉ E-posta Adresi (Mail)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  accessibilityLabel="Giriş E-posta"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  placeholder="ornek@zombiecoder.edu.tr"
                  placeholderTextColor={Colors.outline}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Şifre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>🔑 Şifre</Text>
              <View style={styles.inputBox}>
                <TextInput
                  accessibilityLabel="Giriş Şifre"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.outline}
                  secureTextEntry
                  style={styles.textInput}
                />
              </View>
            </View>

            <TouchableOpacity
              accessibilityLabel="Giriş Yap Butonu"
              style={styles.primarySubmitBtn}
              onPress={handleLoginSubmit}>
              <Text style={styles.primarySubmitBtnText}>
                ▶ OYUNA GİRİŞ YAP
              </Text>
            </TouchableOpacity>

            {/* 3 Gömülü (Seed) Kullanıcı Hızlı Seçim Kartı */}
            <View style={styles.seedCard}>
              <View style={styles.seedHeaderRow}>
                <Text style={styles.seedTitle}>
                  ⚡ HAZIR SEED KULLANICILAR (3 FARKLI ÖĞRENCİ PROFİLİ)
                </Text>
              </View>
              <Text style={styles.seedSubtitle}>
                Dokunarak bilgileri otomatik doldurabilir ve farklı kullanıcı
                temalarını/token kotalarını test edebilirsiniz:
              </Text>

              <View style={styles.seedList}>
                {TEST_PLAYER_ACCOUNTS.map(seed => {
                  const liveAcc = registeredAccounts.find(
                    a => a.uid === seed.uid,
                  );
                  const remaining = liveAcc
                    ? liveAcc.tokenLimit - liveAcc.tokensUsed
                    : seed.dailyTokenLimit - seed.initialTokensUsed;
                  const isSelected =
                    loginEmail.toLocaleLowerCase('tr-TR') ===
                    seed.email.toLocaleLowerCase('tr-TR');

                  return (
                    <TouchableOpacity
                      key={seed.uid}
                      accessibilityLabel={`Seed Kullanıcı ${seed.username}`}
                      style={[
                        styles.seedItemBtn,
                        isSelected && styles.seedItemBtnActive,
                      ]}
                      onPress={() => handleSelectSeedUser(seed)}>
                      <View style={styles.seedItemLeft}>
                        <Text style={styles.seedItemName}>
                          {isSelected ? '◉ ' : '○ '}
                          {seed.defaultName}{' '}
                          <Text style={styles.seedUsernameHighlight}>
                            (@{seed.username})
                          </Text>
                        </Text>
                        <Text style={styles.seedItemMeta}>
                          {seed.email} • {seed.grade}. Sınıf
                        </Text>
                      </View>
                      <View style={styles.tokenQuotaPill}>
                        <Text style={styles.tokenQuotaText}>
                          {remaining} Token
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={styles.switchModeLink}
              onPress={() => {
                setMode('register');
                setErrorMessage(null);
              }}>
              <Text style={styles.switchModeLinkText}>
                Hesabın yok mu? Buradan yeni öğrenci hesabı oluştur →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              &gt;_ YENİ ÖĞRENCİ HESABI OLUŞTUR (1000 TOKEN KOTA)
            </Text>

            {/* 1. Mail */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>1. E-posta Adresi (Mail) *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  accessibilityLabel="Kayıt E-posta"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder="ogrenci@zombiecoder.edu.tr"
                  placeholderTextColor={Colors.outline}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* 2. Şifre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>2. Şifre *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  accessibilityLabel="Kayıt Şifre"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="En az 4 karakter"
                  placeholderTextColor={Colors.outline}
                  secureTextEntry
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* 3. Ad Soyad */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>3. Ad Soyad *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  accessibilityLabel="Kayıt Ad Soyad"
                  value={regFullName}
                  onChangeText={setRegFullName}
                  placeholder="Örn: Ali Veli"
                  placeholderTextColor={Colors.outline}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* 4. Kullanıcı Adı */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                4. Kullanıcı Adı (Karakter Üstünde Görünür) *
              </Text>
              <View style={styles.inputBox}>
                <Text style={styles.atPrefix}>@</Text>
                <TextInput
                  accessibilityLabel="Kayıt Kullanıcı Adı"
                  value={regUsername}
                  onChangeText={setRegUsername}
                  placeholder="ali_coder"
                  placeholderTextColor={Colors.outline}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* 5. Cinsiyet & Karakter Görünümü */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                5. Karakter Cinsiyeti &amp; Görünümü *
              </Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  accessibilityLabel="Kız Karakter Seç"
                  style={[
                    styles.genderOptionBtn,
                    regGender === 'female' && styles.genderOptionBtnActive,
                  ]}
                  onPress={() => setRegGender('female')}>
                  <Text style={styles.genderOptionEmoji}>👩</Text>
                  <View style={styles.genderOptionTextCol}>
                    <Text
                      style={[
                        styles.genderOptionTitle,
                        regGender === 'female' && styles.genderOptionTitleActive,
                      ]}>
                      {regGender === 'female' ? '◉ ' : '○ '}Kız Karakter
                    </Text>
                    <Text style={styles.genderOptionSub}>
                      Kadın Coder Öğrenci
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityLabel="Erkek Karakter Seç"
                  style={[
                    styles.genderOptionBtn,
                    regGender === 'male' && styles.genderOptionBtnActive,
                  ]}
                  onPress={() => setRegGender('male')}>
                  <Text style={styles.genderOptionEmoji}>👨</Text>
                  <View style={styles.genderOptionTextCol}>
                    <Text
                      style={[
                        styles.genderOptionTitle,
                        regGender === 'male' && styles.genderOptionTitleActive,
                      ]}>
                      {regGender === 'male' ? '◉ ' : '○ '}Erkek Karakter
                    </Text>
                    <Text style={styles.genderOptionSub}>
                      Erkek Coder Öğrenci
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. Eğitim Durumu {1. Sınıf, 2. Sınıf, 3. Sınıf, 4. Sınıf} */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                6. Eğitim Durumu (Akademik Sınıf) *
              </Text>
              <View style={styles.gradeGrid}>
                {GRADE_OPTIONS.map(opt => {
                  const active = regGrade === opt.grade;
                  return (
                    <TouchableOpacity
                      key={opt.grade}
                      accessibilityLabel={`Eğitim Durumu ${opt.label}`}
                      style={[
                        styles.gradeOptionBtn,
                        active && styles.gradeOptionBtnActive,
                      ]}
                      onPress={() => setRegGrade(opt.grade)}>
                      <Text
                        style={[
                          styles.gradeOptionText,
                          active && styles.gradeOptionTextActive,
                        ]}>
                        {active ? '◉ ' : '○ '}
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              accessibilityLabel="Kayıt Ol ve Oyuna Başla Butonu"
              style={styles.primarySubmitBtn}
              onPress={handleRegisterSubmit}>
              <Text style={styles.primarySubmitBtnText}>
                ✨ KAYIT OL VE OYUNA GİR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeLink}
              onPress={() => {
                setMode('login');
                setErrorMessage(null);
              }}>
              <Text style={styles.switchModeLinkText}>
                Zaten hesabın var mı? Giriş ekranına dön →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
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
    borderWidth: 1,
    borderColor: '#1f2937',
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
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainer,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242c3d',
  },
  heroLogo: {
    width: 72,
    height: 72,
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  simBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  simBadgeText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  heroTitle: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
  },
  heroSub: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  tabBtnActive: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.primaryContainer,
  },
  tabBtnText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: Colors.primaryContainer,
  },
  errorBanner: {
    backgroundColor: 'rgba(147, 0, 10, 0.45)',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#ffdad6',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  sectionTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a3244',
  },
  atPrefix: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 13,
    paddingVertical: 9,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252b3b',
    gap: 8,
  },
  genderOptionBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  genderOptionEmoji: {
    fontSize: 22,
  },
  genderOptionTextCol: {
    flex: 1,
  },
  genderOptionTitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  genderOptionTitleActive: {
    color: Colors.primaryContainer,
  },
  genderOptionSub: {
    color: Colors.outline,
    fontSize: 9,
    marginTop: 1,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeOptionBtn: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252b3b',
  },
  gradeOptionBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  gradeOptionText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  gradeOptionTextActive: {
    color: Colors.primaryContainer,
  },
  primarySubmitBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  primarySubmitBtnText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seedCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#222b3d',
    marginTop: 4,
  },
  seedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seedTitle: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  seedSubtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 15,
  },
  seedList: {
    gap: 6,
  },
  seedItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252d3f',
  },
  seedItemBtnActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  seedItemLeft: {
    flex: 1,
    gap: 2,
  },
  seedItemName: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  seedUsernameHighlight: {
    color: Colors.primaryContainer,
  },
  seedItemMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  tokenQuotaPill: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tokenQuotaText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  switchModeLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchModeLinkText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
});
